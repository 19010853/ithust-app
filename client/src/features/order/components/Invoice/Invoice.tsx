import { Document, Font, Page, StyleSheet } from '@react-pdf/renderer';
import { FC, ReactElement } from 'react';

import InvoiceTextInfo from './components/InvoiceTextInfo';
import InvoiceTitle from './components/InvoiceTitle';
import InvoiceUserInfo from './components/InvoiceUserInfo';
import TableBody from './components/TableBody';
import TableHead from './components/TableHead';
import TableTotal from './components/TableTotal';

const styles = StyleSheet.create({
  page: { fontSize: 11, fontFamily: 'Noto Sans', paddingTop: 20, paddingLeft: 40, paddingRight: 40, lineHeight: 1.5, flexDirection: 'column' }
});

Font.register({
  family: 'Noto Sans',
  fonts: [
    {
      src: '/fonts/NotoSans-Regular.ttf',
      fontWeight: 400
    },
    {
      src: '/fonts/NotoSans-Bold.ttf',
      fontWeight: 700
    }
  ]
});

const Invoice: FC = (): ReactElement => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <InvoiceTitle />
        <InvoiceUserInfo />
        <TableHead />
        <TableBody />
        <TableTotal />
        <InvoiceTextInfo />
      </Page>
    </Document>
  );
};

export default Invoice;
