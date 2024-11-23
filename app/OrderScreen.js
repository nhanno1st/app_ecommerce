import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { useRouter } from 'expo-router'; // Sử dụng router để điều hướng

const OrderScreen = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const userId = currentUser?.uid;
    const [orders, setOrders] = useState([]);
    const router = useRouter();

    // Hàm chuyển đổi trạng thái từ số sang chuỗi
    const getStatusText = (status) => {
        switch (status) {
            case 1:
                return 'Đang xử lý';
            case 2:
                return 'Đang giao';
            case 3:
                return 'Bị hủy';
            case 4:
                return 'Đã giao hàng';
            default:
                return 'Không xác định';
        }
    };

    // Lấy thông tin đơn hàng từ Firestore
    const fetchOrders = async () => {
        if (!userId) {
            Alert.alert('Thông báo', 'Bạn chưa đăng nhập!');
            return;
        }

        try {
            // Truy vấn đơn hàng theo userId
            const q = query(collection(db, 'order'), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const ordersArray = querySnapshot.docs.map((docSnapshot) => ({
                ...docSnapshot.data(),
                id: docSnapshot.id,
            }));

            setOrders(ordersArray);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đơn hàng:', error.message);
            Alert.alert('Có lỗi xảy ra khi lấy danh sách đơn hàng!');
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Hiển thị chi tiết đơn hàng
    const viewOrderDetails = (orderCode) => {
        router.push(`./OrderDetailCustomer?orderCode=${orderCode}`);
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderContainer}>
            <View style={styles.orderDetails}>
                <Text style={styles.orderText}>Mã đơn hàng: {item.order_code}</Text>
                <Text style={styles.orderText}>Tổng tiền: {item.totalsPrice} VNĐ</Text>
                {item.date ? (
                    <Text style={styles.orderText}>
                        Ngày đặt hàng: {new Date(item.date.seconds * 1000).toLocaleDateString()}
                    </Text>
                ) : (
                    <Text style={styles.orderText}>Ngày đặt hàng: Không có</Text>
                )}
                {/* Sử dụng hàm getStatusText để hiển thị trạng thái */}
                <Text style={styles.orderText}>Trạng thái: {getStatusText(item.status)}</Text>
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title="Chi tiết"
                    onPress={() => viewOrderDetails(item.order_code)}
                    color="#4CAF50"
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Đơn hàng của bạn</Text>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Bạn chưa có đơn hàng nào!</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    orderContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    orderDetails: {
        marginBottom: 10,
    },
    orderText: {
        fontSize: 16,
        color: '#555',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#aaa',
        marginTop: 20,
    },
});

export default OrderScreen;
