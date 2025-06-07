import { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

const SOCKET_URL = 'http://localhost:3000'; // URL của backend

export const useSocket = () => {
    const { user } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (user) {
            // Khởi tạo kết nối socket khi user đã đăng nhập
            socketRef.current = io(SOCKET_URL);

            // Gửi event để tham gia phòng riêng
            socketRef.current.emit('joinRoom', user.id);

            socketRef.current.on('connect', () => {
                console.log('Đã kết nối tới Socket.IO server!');
            });
            
            // Dọn dẹp khi component unmount
            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [user]);

    return socketRef;
};