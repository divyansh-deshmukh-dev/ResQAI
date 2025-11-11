import React from 'react';
import { Icon } from '@iconify/react';
import locationIcon from '@iconify/icons-mdi/fire-alert';

const Header: React.FC = () => (
  <header className="header">
    <h1><Icon icon={locationIcon} /> Satellite Fire Detection</h1>
  </header>
);

export default Header;