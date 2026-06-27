import { StyleSheet, Text, View } from '@react-pdf/renderer';
import { FC, ReactElement } from 'react';

const styles = StyleSheet.create({
  spaceBetween: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', color: '#3E3E3E' },
  titleContainer: { flexDirection: 'row', marginTop: 20 },
  info: { fontSize: 9, fontFamily: 'Noto Sans', fontWeight: 400 }
});

const InvoiceTextInfo: FC = (): ReactElement => {
  return (
    <>
      <View style={styles.titleContainer}>
        <View style={styles.spaceBetween}>
          <View>
            <Text style={styles.info}>Được mua trên ITHust.com thông qua ITHust Limited</Text>
            <Text style={styles.info}>Bạn có câu hỏi về hóa đơn hoặc thanh toán? Hãy liên hệ với chúng tôi</Text>
          </View>
        </View>
      </View>
    </>
  );
};

export default InvoiceTextInfo;
