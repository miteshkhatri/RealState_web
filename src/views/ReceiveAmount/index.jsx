
import React, { useEffect, useState, useRef } from 'react';
import ThemeLoader from 'components/Loader/ThemeLoader';
import AmountTable from './AmountTable';
import AddBooking from 'views/bookings/AddBooking';
import AddAmount from './AddAmount';
import axios from 'axios';
import { API_BASE_URL } from 'config/constant';
import RecordTable from './Table';
import api from 'utils/api';
import './style.css';
import { useLocation } from 'react-router-dom';

function Index() {
  const location = useLocation();
  const isPendingOnly = location.pathname.includes('/pendingamount') || location.state?.filterPendingOnly;
  
  const [ReceiveAmountData, setReceiveAmountData] = useState();
  const userData = JSON.parse(localStorage.getItem('users'));
  const pressedKeys = useRef(new Set());

  const getAllReceiveAmount = async () => {
    try {
      const res = await api.get(
        `/receiveamount/customerbaserecord?user_id=${userData?.user_id}`,
        {
          headers: { Authorization: userData.user_token },
        }
      );

      if (res.data.success) {

         
        setReceiveAmountData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllReceiveAmount();
  }, []);

  const [showAmountB, setShowAmountB] = useState(false);

  // ✅ New columns: Sec/Plot + Rec Amt / Mode + Pen Amount + Date
  const baseColumns = [
    '#',
    'Name',
    'Project',
    'Sec/Plot',        // Sector + Plot
    'Rec Amt / Mode', // Amount + Payment mode
    // 'Pen Amount',
    'Pen Amount ' ,
    'Total Amount',    // amount_b (Ctrl + B se toggle)
    isPendingOnly ? 'Booking Date' : 'Receive Date',
    'Action',
  ];

  // default: Pen Amount hidden, Ctrl+B → show/hide
  const filteredColumns = showAmountB
    ? baseColumns
    : baseColumns.filter((column) => column !== 'Pen Amountt');

  // 🚀 Filter ReceiveAmountData to unique plot_no per project
  const uniqueReceiveData = () => {
    if (!ReceiveAmountData) return [];

    const map = {};
    ReceiveAmountData.forEach((item) => {
      const key = `${item.project_name}_${item.plot_no}`;
      if (!map[key]) {
        map[key] = item;
      } else {
        const existingDate = new Date(map[key].receive_date);
        const currentDate = new Date(item.receive_date);

        if (currentDate < existingDate) {
          map[key] = item;
        } else if (currentDate.getTime() === existingDate.getTime()) {
          if (item.id < map[key].id) {
            map[key] = item;
          }
        }
      }
    });

    let data = Object.values(map);
    if (isPendingOnly) {
      data = data.filter((item) => Math.floor(Number(item.pending_amount)) > 0);
    }
    return data;
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      pressedKeys.current.add(event.key.toLowerCase());

      if (
        (event.ctrlKey || pressedKeys.current.has('control')) &&
        pressedKeys.current.has('b') &&
        pressedKeys.current.has('c')
      ) {
        setShowAmountB((prev) => !prev); // Ctrl + B + C toggle for Pen Amount
        pressedKeys.current.clear();
      }
    };

    const handleKeyUp = (event) => {
      pressedKeys.current.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  if (!ReceiveAmountData) {
    return <ThemeLoader />;
  }

  return (
    <>
      <RecordTable
        data={uniqueReceiveData()}
        title={isPendingOnly ? "Pending Amount" : "Receive Amount"}
        columns={filteredColumns}
        getAllReceiveAmount={getAllReceiveAmount} // 🔁 refresh ke लिए
      />
    </>
  );
}

export default Index;
