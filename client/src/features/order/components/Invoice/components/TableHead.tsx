import { StyleSheet, Text, View } from '@react-pdf/renderer';
import { FC, ReactElement } from 'react';

const styles = StyleSheet.create({
  theader: {
    marginTop: 20,
    fontSize: 10,
    fontFamily: 'Lato Bold',
    fontWeight: 'bold',
    paddingTop: 4,
    textAlign: 'center',
    flex: 1,
    height: 20,
    borderBottomWidth: 1
  },
  theader2: { flex: 2, textAlign: 'left', borderRightWidth: 0, borderBottomWidth: 1 }
});

const TableHead: FC = (): ReactElement => {
  return (
    <>
      <View style={{ width: '100%', flexDirection: 'row', marginTop: 10 }}>
        <View style={[styles.theader, styles.theader2]}>
          <Text>Dịch vụ</Text>
        </View>
        <View style={styles.theader}></View>
        <View style={styles.theader}></View>
        <View style={styles.theader}></View>
        <View style={styles.theader}></View>
        <View style={styles.theader}>
          <Text>SL</Text>
        </View>
        <View style={styles.theader}>
          <Text>Giá (VND)</Text>
        </View>
        <View style={styles.theader}>
          <Text>Tổng (VND)</Text>
        </View>
      </View>
    </>
  );
};

export default TableHead;
