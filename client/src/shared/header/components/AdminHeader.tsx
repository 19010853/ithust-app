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
        <div className="relative">
          <Button
            className="flex items-center gap-3 rounded px-2 py-1 text-left hover:bg-gray-50"
            onClick={() => setShowMenu(!showMenu)}
            label={
              <>
                <img
                  src={authUser.profilePicture || 'https://placehold.co/150x150?text=Admin'}
                  alt="admin profile"
                  className="h-9 w-9 rounded-full object-cover"
                />
                <span className="text-sm font-semibold text-gray-900">{authUser.username || 'Admin'}</span>
              </>
            }
          />
          {showMenu && (
            <div className="absolute left-0 top-12 z-50 w-44 divide-y divide-gray-100 rounded border border-grey bg-white shadow-md">
              <ul className="py-2 text-sm text-gray-700">
                <li>
                  <Link
                    to="/admin/settings"
                    className="block px-4 py-2 hover:text-sky-500"
                    onClick={() => setShowMenu(false)}
                  >
                    Settings
                  </Link>
                </li>
              </ul>
              <div className="py-1">
                <button className="block w-full px-4 py-2 text-left text-sm hover:text-sky-500" onClick={onLogout}>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
        <Link to="/admin/dashboard" className="text-sm font-bold text-gray-900">
          Admin Dashboard
        </Link>
      </div>
    </header>
  );
};

export default AdminHeader;
