import Quill from 'quill';
import { ChangeEvent, FC, ReactElement, useRef, useState } from 'react';
import equal from 'react-fast-compare';
import { FaCamera } from 'react-icons/fa';
import ReactQuill, { UnprivilegedEditor } from 'react-quill';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import { ISellerDocument } from 'src/features/sellers/interfaces/seller.interface';
import { addSeller } from 'src/features/sellers/reducers/seller.reducer';
import Breadcrumb from 'src/shared/breadcrumb/Breadcrumb';
import Button from 'src/shared/button/Button';
import Dropdown from 'src/shared/dropdown/Dropdown';
import TextAreaInput from 'src/shared/inputs/TextAreaInput';
import TextInput from 'src/shared/inputs/TextInput';
import ApprovalModal from 'src/shared/modals/ApprovalModal';
import { IApprovalModalContent } from 'src/shared/modals/interfaces/modal.interface';
import CircularPageLoader from 'src/shared/page-loader/CircularPageLoader';
import { IResponse } from 'src/shared/shared.interface';
import { GIG_MAX_PRICE_VND, GIG_MIN_PRICE_VND } from 'src/shared/utils/currency.utils';
import { checkImage, readAsBase64 } from 'src/shared/utils/image-utils.service';
import {
  categories,
  expectedGigDelivery,
  lowerCase,
  reactQuillUtils,
  replaceSpacesWithDash,
  showErrorToast
} from 'src/shared/utils/utils.service';
import { useAppDispatch, useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';

import { useGigSchema } from '../../hooks/useGigSchema';
import { GIG_MAX_LENGTH, IAllowedGigItem, ICreateGig, IShowGigModal } from '../../interfaces/gig.interface';
import { gigInfoSchema } from '../../schemes/gig.schema';
import { useCreateGigMutation } from '../../services/gigs.service';
import TagsInput from './components/TagsInput';

const defaultGigInfo: ICreateGig = {
  title: '',
  categories: '',
  description: '',
  subCategories: [],
  tags: [],
  price: 0,
  coverImage: 'https://placehold.co/330x220?text=%E1%BA%A2nh+b%C3%ACa',
  expectedDelivery: 'Thời gian giao dự kiến',
  basicTitle: '',
  basicDescription: ''
};

const restrictionLabel = (status?: string | null): string => {
  const labels: Record<string, string> = {
    ACCOUNT_LOCKED: 'tài khoản bị khóa',
    SELLER_RESTRICTED: 'người bán bị hạn chế',
    SELLER_LOCKED_HARD: 'người bán bị khóa cứng'
  };
  return labels[`${status}`] || `${status || ''}`;
};

const AddGig: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const seller = useAppSelector((state: IReduxState) => state.seller);
  const [gigInfo, setGigInfo] = useState<ICreateGig>(defaultGigInfo);
  const [subCategory, setSubCategory] = useState<string[]>([]);
  const [subCategoryInput, setSubCategoryInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState<string>('');
  const [showGigModal, setShowGigModal] = useState<IShowGigModal>({
    image: false,
    cancel: false
  });
  const reactQuillRef = useRef<ReactQuill | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [allowedGigItemLength, setAllowedGigItemLength] = useState<IAllowedGigItem>({
    gigTitle: '80/80',
    basicTitle: '40/40',
    basicDescription: '100/100',
    descriptionCharacters: '1200/1200'
  });
  const gigInfoRef = useRef<ICreateGig>(defaultGigInfo);
  const [approvalModalContent, setApprovalModalContent] = useState<IApprovalModalContent>();
  const navigate: NavigateFunction = useNavigate();
  const dispatch = useAppDispatch();
  const { sellerId } = useParams();
  const [schemaValidation, validationErrors] = useGigSchema({ schema: gigInfoSchema, gigInfo });
  const [createGig, { isLoading }] = useCreateGigMutation();
  const sellerIsRestricted =
    seller?.accountStatus === 'ACCOUNT_LOCKED' || seller?.sellerStatus === 'SELLER_RESTRICTED' || seller?.sellerStatus === 'SELLER_LOCKED_HARD';
  const getErrorMessage = (field: keyof ICreateGig): string => {
    const error = validationErrors.find((item) => typeof item === 'object' && field in item);
    const message = typeof error === 'object' ? (error as Record<string, unknown>)[field] : '';
    return typeof message === 'string' ? message : '';
  };

  const handleFileChange = async (event: ChangeEvent): Promise<void> => {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    if (target.files) {
      const file: File = target.files[0];
      const isValid = checkImage(file, 'image');
      if (isValid) {
        const dataImage: string | ArrayBuffer | null = await readAsBase64(file);
        setGigInfo({ ...gigInfo, coverImage: `${dataImage}` });
      }
      setShowGigModal({ ...showGigModal, image: false });
    }
  };

  const onCreateGig = async (): Promise<void> => {
    if (sellerIsRestricted) {
      showErrorToast('Quyền bán hàng của bạn đang bị hạn chế. Bạn không thể tạo gig mới.');
      return;
    }
    try {
      const editor: Quill | undefined = reactQuillRef?.current?.editor;
      // In React, it is not recommended to mutate objects directly. It is better to update with useState method.
      // The reason it is not recommended is because if the object is mutated directly,
      // 1) React is not able to keep track of the change
      // 2) There will be no re-renderng of the component.
      // In our case, we don't care about the above reasons because we update a property, validate and send to the backend.
      // The updated properly is not reflected in the component and we don't need to keep track of the object.
      // We are not using the useState method inside useEffect because it causes too many rerender errors.
      // Also, we are not updating the property inside the onChange method because editor?.getText() causes too many rerender errors.
      // The only option we have right now is to directly mutate the gigInfo useState object.
      gigInfo.description = editor?.getText().trim() as string;
      const isValid: boolean = await schemaValidation();
      if (isValid) {
        const gig: ICreateGig = {
          profilePicture: `${authUser.profilePicture}`,
          sellerId,
          title: gigInfo.title,
          categories: gigInfo.categories,
          description: gigInfo.description,
          subCategories: subCategory,
          tags,
          price: gigInfo.price,
          coverImage: gigInfo.coverImage,
          expectedDelivery: gigInfo.expectedDelivery,
          basicTitle: gigInfo.basicTitle,
          basicDescription: gigInfo.basicDescription
        };
        const response: IResponse = await createGig(gig).unwrap();
        const updatedSeller: ISellerDocument = { ...seller, totalGigs: (seller.totalGigs as number) + 1 };
        dispatch(addSeller(updatedSeller));
        const title: string = replaceSpacesWithDash(gig.title);
        navigate(`/gig/${lowerCase(`${authUser.username}`)}/${title}/${response?.gig?.sellerId}/${response?.gig?.id}/view`);
      }
    } catch (error) {
      showErrorToast('Không thể tạo gig');
    }
  };

  const onCancelCreate = (): void => {
    navigate(`/seller_profile/${lowerCase(`${authUser.username}/${sellerId}/edit`)}`);
  };

  return (
    <>
      {showGigModal.cancel && (
        <ApprovalModal
          approvalModalContent={approvalModalContent}
          onClose={() => setShowGigModal({ ...showGigModal, cancel: false })}
          onClick={onCancelCreate}
        />
      )}
      <div className="relative w-screen">
        <Breadcrumb breadCrumbItems={['Người bán', 'Tạo gig mới']} />
        <div className="container relative mx-auto my-5 px-2 pb-12 md:px-0">
          {isLoading && <CircularPageLoader />}
          {authUser && !authUser.emailVerified && (
            <div className="absolute left-0 top-0 z-[80] flex h-full w-full justify-center bg-white/[0.8] text-sm font-bold md:text-base lg:text-xl">
              <span className="mt-40">Vui lòng xác minh email của bạn.</span>
            </div>
          )}
          {sellerIsRestricted && (
            <div className="mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Quyền bán hàng của bạn hiện đang ở trạng thái {restrictionLabel(seller?.sellerStatus || seller?.accountStatus)}. Chức năng tạo gig mới đã bị tắt.
            </div>
          )}

          <div className="border-grey left-0 top-0 z-10 mt-4 block rounded border bg-white p-6">
            <div className="mb-6 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Tiêu đề gig<sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="col-span-4 md:w-11/12 lg:w-8/12">
                <TextInput
                  className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
                  type="text"
                  name="gigTitle"
                  value={gigInfo.title}
                  placeholder="Tôi sẽ làm thật tốt một việc cụ thể."
                  maxLength={80}
                  onChange={(event: ChangeEvent) => {
                    const gigTitleValue: string = (event.target as HTMLInputElement).value;
                    setGigInfo({ ...gigInfo, title: gigTitleValue });
                    const counter: number = GIG_MAX_LENGTH.gigTitle - gigTitleValue.length;
                    setAllowedGigItemLength({ ...allowedGigItemLength, gigTitle: `${counter}/80` });
                  }}
                />
                <span className="flex justify-end text-xs text-[#95979d]">{allowedGigItemLength.gigTitle} ký tự</span>
              </div>
            </div>
            <div className="mb-6 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Tiêu đề gói cơ bản<sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="col-span-4 md:w-11/12 lg:w-8/12">
                <TextInput
                  className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
                  placeholder="Viết ngắn gọn chính xác bạn sẽ làm gì."
                  type="text"
                  name="basicTitle"
                  value={gigInfo.basicTitle}
                  maxLength={40}
                  onChange={(event: ChangeEvent) => {
                    const basicTitleValue: string = (event.target as HTMLInputElement).value;
                    setGigInfo({ ...gigInfo, basicTitle: basicTitleValue });
                    const counter: number = GIG_MAX_LENGTH.basicTitle - basicTitleValue.length;
                    setAllowedGigItemLength({ ...allowedGigItemLength, basicTitle: `${counter}/40` });
                  }}
                />
                <span className="flex justify-end text-xs text-[#95979d]">{allowedGigItemLength.basicTitle} ký tự</span>
              </div>
            </div>
            <div className="mb-6 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Mô tả ngắn<sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="col-span-4 md:w-11/12 lg:w-8/12">
                <TextAreaInput
                  className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
                  placeholder="Viết mô tả ngắn..."
                  name="basicDescription"
                  value={gigInfo.basicDescription}
                  rows={5}
                  maxLength={100}
                  onChange={(event: ChangeEvent) => {
                    const basicDescriptionValue: string = (event.target as HTMLInputElement).value;
                    setGigInfo({ ...gigInfo, basicDescription: basicDescriptionValue });
                    const counter: number = GIG_MAX_LENGTH.basicDescription - basicDescriptionValue.length;
                    setAllowedGigItemLength({ ...allowedGigItemLength, basicDescription: `${counter}/100` });
                  }}
                />
                <span className="flex justify-end text-xs text-[#95979d]">{allowedGigItemLength.basicDescription} ký tự</span>
              </div>
            </div>
            <div className="mb-6 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Mô tả đầy đủ<sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="col-span-4 md:w-11/12 lg:w-8/12">
                <ReactQuill
                  theme="snow"
                  value={gigInfo.description}
                  className="border-grey border rounded"
                  modules={reactQuillUtils().modules}
                  formats={reactQuillUtils().formats}
                  ref={(element: ReactQuill | null) => {
                    reactQuillRef.current = element;
                    const reactQuillEditor = reactQuillRef.current?.getEditor();
                    reactQuillEditor?.on('text-change', () => {
                      if (reactQuillEditor.getLength() > GIG_MAX_LENGTH.fullDescription) {
                        reactQuillEditor.deleteText(GIG_MAX_LENGTH.fullDescription, reactQuillEditor.getLength());
                      }
                    });
                  }}
                  onChange={(event: string, _, __, editor: UnprivilegedEditor) => {
                    setGigInfo({ ...gigInfo, description: event });
                    const counter: number = GIG_MAX_LENGTH.fullDescription - editor.getText().length;
                    setAllowedGigItemLength({ ...allowedGigItemLength, descriptionCharacters: `${counter}/1200` });
                  }}
                />
                <span className="flex justify-end text-xs text-[#95979d]">{allowedGigItemLength.descriptionCharacters} ký tự</span>
              </div>
            </div>
            <div className="mb-12 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Danh mục<sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="relative col-span-4 md:w-11/12 lg:w-8/12">
                <Dropdown
                  text={gigInfo.categories}
                  maxHeight="300"
                  mainClassNames="absolute bg-white"
                  values={categories()}
                  onClick={(item: string) => {
                    setGigInfo({ ...gigInfo, categories: item });
                  }}
                />
              </div>
            </div>

            <TagsInput
              title="Danh mục con"
              placeholder="VD: Phát triển website, ứng dụng di động"
              gigInfo={gigInfo}
              setGigInfo={setGigInfo}
              tags={subCategory}
              itemInput={subCategoryInput}
              itemName="subCategories"
              counterText="danh mục con"
              inputErrorMessage={false}
              setItem={setSubCategory}
              setItemInput={setSubCategoryInput}
            />

            <TagsInput
              title="Thẻ"
              placeholder="Nhập từ khóa tìm kiếm cho gig của bạn"
              gigInfo={gigInfo}
              setGigInfo={setGigInfo}
              tags={tags}
              itemInput={tagsInput}
              itemName="tags"
              counterText="thẻ"
              inputErrorMessage={false}
              setItem={setTags}
              setItemInput={setTagsInput}
            />

            <div className="mb-6 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Giá<sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="col-span-4 md:w-11/12 lg:w-8/12">
                <TextInput
                  type="number"
                  className="border-grey mb-1 w-full rounded border p-3.5 text-sm font-normal text-gray-600 focus:outline-none"
                  placeholder="Nhập giá VND"
                  name="price"
                  value={`${gigInfo.price}`}
                  min={GIG_MIN_PRICE_VND}
                  max={GIG_MAX_PRICE_VND}
                  step={1}
                  onChange={(event: ChangeEvent) => {
                    const value: string = (event.target as HTMLInputElement).value;
                    const price = Number(value);
                    setGigInfo({ ...gigInfo, price: Number.isInteger(price) && price > 0 ? price : 0 });
                  }}
                />
                {getErrorMessage('price') && <p className="mt-1 text-xs text-red-500">{getErrorMessage('price')}</p>}
              </div>
            </div>
            <div className="mb-12 grid md:grid-cols-5">
              <div className="pb-2 text-base font-medium">
                Thời gian giao dự kiến<sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div className="relative col-span-4 md:w-11/12 lg:w-8/12">
                <Dropdown
                  text={gigInfo.expectedDelivery}
                  maxHeight="300"
                  mainClassNames="absolute bg-white z-40"
                  values={expectedGigDelivery()}
                  onClick={(item: string) => {
                    setGigInfo({ ...gigInfo, expectedDelivery: item });
                  }}
                />
              </div>
            </div>
            <div className="mb-6 grid md:grid-cols-5">
              <div className="mt-6 pb-2 text-base font-medium lg:mt-0">
                Ảnh bìa<sup className="top-[-0.3em] text-base text-red-500">*</sup>
              </div>
              <div
                className="relative col-span-4 cursor-pointer md:w-11/12 lg:w-8/12"
                onMouseEnter={() => {
                  setShowGigModal((item) => ({ ...item, image: !item.image }));
                }}
                onMouseLeave={() => {
                  setShowGigModal((item) => ({ ...item, image: false }));
                }}
              >
                {gigInfo.coverImage && (
                  <img src={gigInfo.coverImage} alt="Ảnh bìa" className="left-0 top-0 h-[220px] w-[320px] bg-white object-cover" />
                )}
                {!gigInfo.coverImage && (
                  <div className="left-0 top-0 flex h-[220px] w-[320px] cursor-pointer justify-center bg-[#dee1e7]"></div>
                )}
                {showGigModal.image && (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="absolute left-0 top-0 flex h-[220px] w-[320px] cursor-pointer justify-center bg-[#dee1e7]"
                  >
                    <FaCamera className="flex self-center" />
                  </div>
                )}
                <TextInput
                  name="image"
                  ref={fileRef}
                  type="file"
                  style={{ display: 'none' }}
                  onClick={() => {
                    if (fileRef.current) {
                      fileRef.current.value = '';
                    }
                  }}
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="grid xs:grid-cols-1 md:grid-cols-5">
              <div className="pb-2 text-base font-medium lg:mt-0"></div>
              <div className="col-span-4 flex gap-x-4 md:w-11/12 lg:w-8/12">
                <Button
                  disabled={isLoading || sellerIsRestricted}
                  className="rounded bg-sky-500 px-8 py-3 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:py-3 md:text-base"
                  label="Tạo gig"
                  onClick={onCreateGig}
                />
                <Button
                  disabled={isLoading}
                  className="rounded bg-red-500 px-8 py-3 text-center text-sm font-bold text-white hover:bg-red-400 focus:outline-none md:py-3 md:text-base"
                  label="Hủy"
                  onClick={() => {
                    const isEqual: boolean = equal(gigInfo, gigInfoRef.current);
                    if (!isEqual) {
                      setApprovalModalContent({
                        header: 'Hủy tạo gig',
                        body: 'Bạn có chắc muốn hủy không?',
                        btnText: 'Có, hủy',
                        btnColor: 'bg-red-500 hover:bg-red-400'
                      });
                      setShowGigModal({ ...showGigModal, cancel: true });
                    } else {
                      onCancelCreate();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddGig;
