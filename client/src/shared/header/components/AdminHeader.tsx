import { FC, ReactElement, useState } from 'react';
import { Link, NavigateFunction, useNavigate } from 'react-router-dom';
import Button from 'src/shared/button/Button';
import { applicationLogout } from 'src/shared/utils/utils.service';
import { useAppDispatch, useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';

const AdminHeader: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();

  const onLogout = (): void => {
    setShowMenu(false);
    applicationLogout(dispatch, navigate);
  };

  return (
    <header className="border-b border-grey bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/admin/users" className="text-2xl font-semibold text-black">
            ITHust
          </Link>
          <nav className="flex items-center gap-5 text-sm font-bold text-gray-900">
            <Link to="/admin/withdrawals" className="hover:text-sky-500">
              Rút tiền
            </Link>
            <Link to="/admin/users" className="hover:text-sky-500">
              Người dùng
            </Link>
            <Link to="/admin/inbox" className="hover:text-sky-500">
              Chat
            </Link>
          </nav>
        </div>
        <div className="relative">
          <Button
            className="flex items-center gap-3 rounded px-2 py-1 text-left hover:bg-gray-50"
            onClick={() => setShowMenu(!showMenu)}
            label={
              <>
                <img
                  src={authUser.profilePicture || 'https://placehold.co/150x150?text=Quan+tri'}
                  alt="Ảnh quản trị viên"
                  className="h-9 w-9 rounded-full object-cover"
                />
                <span className="text-sm font-semibold text-gray-900">{authUser.username || 'Quản trị viên'}</span>
              </>
            }
          />
          {showMenu && (
            <div className="absolute right-0 top-12 z-50 w-44 divide-y divide-gray-100 rounded border border-grey bg-white shadow-md">
              <ul className="py-2 text-sm text-gray-700">
                <li>
                  <Link
                    to="/admin/settings"
                    className="block px-4 py-2 hover:text-sky-500"
                    onClick={() => setShowMenu(false)}
                  >
                    Cài đặt
                  </Link>
                </li>
              </ul>
              <div className="py-1">
                <button className="block w-full px-4 py-2 text-left text-sm hover:text-sky-500" onClick={onLogout}>
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
