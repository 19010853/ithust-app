import { FC, ReactElement } from 'react';

import ChangePassword from '../../settings/components/ChangePassword';

const AdminSettings: FC = (): ReactElement => {
  return (
    <div className="container mx-auto px-4">
      <div className="mt-8 max-w-xl bg-white px-6 pb-7 pt-5">
        <ChangePassword />
      </div>
    </div>
  );
};

export default AdminSettings;
