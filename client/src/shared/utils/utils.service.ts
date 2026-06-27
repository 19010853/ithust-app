import { Dispatch } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
import countries, { LocalizedCountryNames } from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import viLocale from 'i18n-iso-countries/langs/vi.json';
import { filter } from 'lodash';
import millify from 'millify';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logout } from 'src/features/auth/reducers/logout.reducer';
import { clearAuthUser } from 'src/features/auth/reducers/auth.reducer';
import { emptyBuyer } from 'src/features/buyer/reducers/buyer.reducer';
import { emptySeller } from 'src/features/sellers/reducers/seller.reducer';
import { authApi } from 'src/features/auth/services/auth.service';
import { IOrderDocument } from 'src/features/order/interfaces/order.interface';
import { api } from 'src/store/api';

countries.registerLocale(enLocale);
countries.registerLocale(viLocale);

export const lowerCase = (str: string): string => {
  return str.toLowerCase();
};

export const normalizeOrderStatus = (status: string): string => {
  return lowerCase(`${status}`).replace(/[_\s]+/g, ' ').trim();
};

export const firstLetterUppercase = (str: string): string => {
  const valueString = lowerCase(`${str}`);
  return `${valueString.charAt(0).toUpperCase()}${valueString.slice(1).toLowerCase()}`;
};

export const replaceSpacesWithDash = (title: string): string => {
  const lowercaseTitle: string = lowerCase(`${title}`);
  return lowercaseTitle.replace(/\/| /g, '-'); // replace / and space with -
};

export const replaceDashWithSpaces = (title: string): string => {
  const lowercaseTitle: string = lowerCase(`${title}`);
  return lowercaseTitle.replace(/-|\/| /g, ' '); // replace - / and space with -
};

export const replaceAmpersandWithSpace = (title: string): string => {
  return title.replace(/&/g, '');
};

export const replaceAmpersandAndDashWithSpace = (title: string): string => {
  const titleWithoutDash = replaceDashWithSpaces(title);
  return titleWithoutDash.replace(/&| /g, ' ');
};

export const categories = (): string[] => {
  return [
    'Graphics & Design',
    'Digital Marketing',
    'Writing & Translation',
    'Video & Animation',
    'Music & Audio',
    'Programming & Tech',
    'Photography',
    'Data',
    'Business'
  ];
};

export const categoryDisplayLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'Graphic & Design': 'Đồ họa & Thiết kế',
    'Graphics & Design': 'Đồ họa & Thiết kế',
    'Digital Marketing': 'Marketing số',
    'Writing & Translation': 'Viết lách & Dịch thuật',
    'Video & Animation': 'Video & Hoạt hình',
    'Music & Audio': 'Âm nhạc & Âm thanh',
    'Programming & Tech': 'Lập trình & Công nghệ',
    Photography: 'Nhiếp ảnh',
    Data: 'Dữ liệu',
    Business: 'Kinh doanh'
  };
  return labels[category] || category;
};

export const expectedGigDelivery = (): string[] => {
  return [
    '1 ngày',
    '2 ngày',
    '3 ngày',
    '4 ngày',
    '5 ngày',
    '6 ngày',
    '7 ngày',
    '10 ngày',
    '14 ngày',
    '21 ngày',
    '30 ngày',
    '45 ngày',
    '60 ngày',
    '75 ngày',
    '90 ngày'
  ];
};

export const countriesList = (): string[] => {
  const countriesObj: LocalizedCountryNames<{ select: 'official' }> = countries.getNames('vi', { select: 'official' });
  return Object.values(countriesObj);
};

export const saveToSessionStorage = (data: string, username: string): void => {
  window.sessionStorage.setItem('isLoggedIn', data);
  window.sessionStorage.setItem('loggedInuser', username);
};

export const getDataFromSessionStorage = (key: string) => {
  const data = window.sessionStorage.getItem(key) as string;
  return JSON.parse(data);
};

export const saveToLocalStorage = (key: string, data: string): void => {
  window.localStorage.setItem(key, data);
};

export const getDataFromLocalStorage = (key: string) => {
  const data = window.localStorage.getItem(key) as string;
  return JSON.parse(data);
};

export const deleteFromLocalStorage = (key: string): void => {
  window.localStorage.removeItem(key);
};

export const applicationLogout = (dispatch: Dispatch, navigate: NavigateFunction) => {
  const loggedInUsername: string = getDataFromSessionStorage('loggedInuser');
  dispatch(logout({}));
  dispatch(clearAuthUser(undefined));
  dispatch(emptyBuyer(undefined));
  dispatch(emptySeller(undefined));
  if (loggedInUsername) {
    dispatch(authApi.endpoints.removeLoggedInUser.initiate(`${loggedInUsername}`, { track: false }) as never);
  }
  dispatch(api.util.resetApiState());
  dispatch(authApi.endpoints.logout.initiate(loggedInUsername) as never);
  saveToSessionStorage(JSON.stringify(false), JSON.stringify(''));
  deleteFromLocalStorage('becomeASeller');
  navigate('/');
};

export const isFetchBaseQueryError = (error: unknown): boolean => {
  return typeof error === 'object' && error !== null && 'status' in error && 'data' in error;
};

const isActiveHeldStatus = (status: string): boolean => ['in progress', 'delivered', 'revision required', 'disputed'].includes(status);

const orderMatchesStatus = (status: string, order: IOrderDocument): boolean => {
  const requestedStatus = normalizeOrderStatus(status);
  const orderStatus = normalizeOrderStatus(order.status);
  if (isActiveHeldStatus(requestedStatus)) {
    return orderStatus === requestedStatus && order.paymentStatus === 'HELD';
  }
  if (requestedStatus === 'completed') {
    return orderStatus === requestedStatus && order.paymentStatus === 'RELEASED';
  }
  if (requestedStatus === 'cancelled') {
    return orderStatus === requestedStatus;
  }
  return orderStatus === requestedStatus && !['REFUND_PROCESSING', 'REFUNDED'].includes(`${order.paymentStatus || ''}`);
};

export const orderTypes = (status: string, orders: IOrderDocument[]): number => {
  const orderList: IOrderDocument[] = filter(orders, (order: IOrderDocument) => orderMatchesStatus(status, order));
  return orderList.length;
};

export const sellerOrderList = (status: string, orders: IOrderDocument[]): IOrderDocument[] => {
  const orderList: IOrderDocument[] = filter(orders, (order: IOrderDocument) => orderMatchesStatus(status, order));
  return orderList;
};

export const orderStatusDisplayLabel = (status?: string): string => {
  const labels: Record<string, string> = {
    pending: 'Đang chờ',
    'in progress': 'Đang thực hiện',
    delivered: 'Đã giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    disputed: 'Đang tranh chấp',
    refunded: 'Đã hoàn tiền',
    'refund processing': 'Đang hoàn tiền',
    refund_processing: 'Đang hoàn tiền'
  };
  return labels[normalizeOrderStatus(`${status || ''}`)] || `${status || ''}`;
};

export const notificationMessageDisplayLabel = (message?: string): string => {
  const value = `${message || ''}`;
  const exactLabels: Record<string, string> = {
    'placed an order for your gig.': 'đã đặt một đơn hàng cho gig của bạn.',
    'cancelled your order delivery.': 'đã hủy bàn giao đơn hàng của bạn.',
    'approved your order delivery.': 'đã duyệt bàn giao đơn hàng của bạn.',
    'delivered your order.': 'đã bàn giao đơn hàng của bạn.',
    'requested for an order delivery date extension.': 'đã yêu cầu gia hạn ngày giao đơn hàng.',
    'approved your order delivery date extension request.': 'đã phê duyệt yêu cầu gia hạn ngày giao đơn hàng của bạn.',
    'rejected your order delivery date extension request.': 'đã từ chối yêu cầu gia hạn ngày giao đơn hàng của bạn.'
  };
  const reviewMatch = value.match(/^left you a (\d+) star review$/);
  if (reviewMatch) {
    return `đã đánh giá bạn ${reviewMatch[1]} sao`;
  }
  return exactLabels[value] || value;
};

export const degreeList = (): string[] => {
  return ['Cao đẳng', 'Cử nhân nghệ thuật', 'Cử nhân khoa học', 'Thạc sĩ nghệ thuật', 'Thạc sĩ quản trị kinh doanh', 'Thạc sĩ khoa học', 'Tiến sĩ luật', 'Bác sĩ y khoa', 'Tiến sĩ', 'Cử nhân luật', 'Chứng chỉ', 'Khác'];
};

export const languageLevel = (): string[] => {
  return ['Cơ bản', 'Giao tiếp', 'Thành thạo', 'Bản ngữ'];
};

export const yearsList = (maxOffset: number): string[] => {
  const years: string[] = [];
  const currentYear: number = new Date().getFullYear();
  for (let i = 0; i <= maxOffset; i++) {
    const year: number = currentYear - i;
    years.push(`${year}`);
  }
  return years;
};

export const shortenLargeNumbers = (data: number | undefined): string => {
  if (data === undefined) {
    return '0';
  }
  return millify(data, { precision: 0 });
};

export const rating = (num: number): number => {
  if (num) {
    return Math.round(num * 10) / 10;
  }
  return 0.0;
};

export const showSuccessToast = (message: string): void => {
  toast.success(message, {
    position: 'bottom-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: 'colored'
  });
};

export const showErrorToast = (message: string): void => {
  toast.error(message, {
    position: 'bottom-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: 'colored'
  });
};

export const reactQuillUtils = () => {
  const modules = {
    toolbar: [
      ['bold', 'italic'],
      [{ list: 'ordered' }, { list: 'bullet' }]
    ]
  };
  const formats: string[] = ['bold', 'italic', 'list', 'bullet'];
  return { modules, formats };
};

export const generateRandomNumber = (length: number): number => {
  return Math.floor(Math.random() * (9 * Math.pow(10, length - 1))) + Math.pow(10, length - 1);
};

export const bytesToSize = (bytes: number): string => {
  const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return 'n/a';
  }
  const i = parseInt(`${Math.floor(Math.log(bytes) / Math.log(1024))}`, 10);
  if (i === 0) {
    return `${bytes} ${sizes[i]}`;
  }
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

export const getFileBlob = async (url: string): Promise<AxiosResponse> => {
  const response: AxiosResponse = await axios.get(url, { responseType: 'blob' });
  return response;
};

export const downloadFile = (blobUrl: string, fileName: string): void => {
  const link: HTMLAnchorElement = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', `${fileName}`);
  // Append to html link element page
  document.body.appendChild(link);
  // Start download
  link.click();
  // Clean up and remove link
  if (link.parentNode) {
    link.parentNode.removeChild(link);
  }
};
