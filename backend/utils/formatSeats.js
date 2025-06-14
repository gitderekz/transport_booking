module.exports = function arrangeSeatsInLayout(layout, bookedSeats = []) {
  if (!layout || !layout.rows || !layout.columns) return [];

  const { rows, columns } = layout;
  const bookedMap = {};
  
  for (const seat of bookedSeats) {
    bookedMap[seat.seat_number] = {
      status: 'booked',
      passenger_name: seat.passenger_name,
      passenger_gender: seat.passenger_gender
    };
  }

  const seatArrangement = [];

  for (let r = 1; r <= rows; r++) {
    const row = [];

    for (let c = 0; c < columns; c++) {
      const letter = String.fromCharCode(65 + c); // 'A', 'B', ...
      const seatNumber = `${r}${letter}`;
      const seatInfo = bookedMap[seatNumber];

      row.push({
        number: seatNumber,
        status: seatInfo ? 'booked' : 'available',
        passenger_name: seatInfo?.passenger_name || null,
        passenger_gender: seatInfo?.passenger_gender || null
      });
    }

    seatArrangement.push(row);
  }

  return seatArrangement;
};




// module.exports = function arrangeSeatsInLayout(layout, bookedSeats = []) {
//   if (!layout || !layout.rows || !layout.columns) return [];

//   const { rows, columns } = layout;
//   const bookedMap = {};

//   for (const seat of bookedSeats) {
//     bookedMap[seat.seat_number] = {
//       status: 'booked',
//       passenger_name: seat.passenger_name,
//       passenger_gender: seat.passenger_gender
//     };
//   }

//   const seatArrangement = [];

//   for (let r = 1; r <= rows; r++) {
//     const row = [];

//     for (let c = 0; c < columns; c++) {
//       const letter = String.fromCharCode(65 + c); // 'A', 'B', ...
//       const number = `${r}${letter}`;
//       const seat = {
//         number,
//         status: bookedMap[number]?.status || 'available',
//         passenger_name: bookedMap[number]?.passenger_name || null,
//         passenger_gender: bookedMap[number]?.passenger_gender || null
//       };
//       row.push(seat);
//     }

//     seatArrangement.push(row);
//   }

//   return seatArrangement;
// };




// const formatSeats = (seatLayout, bookedSeats = []) => {
//   if (!seatLayout || !seatLayout.rows || !seatLayout.columns) return [];

//   const rows = seatLayout.rows;
//   const columns = seatLayout.columns;
//   const bookedMap = {};

//   for (const seat of bookedSeats) {
//     bookedMap[seat.seat_number] = {
//       status: 'booked',
//       passenger_name: seat.passenger_name,
//       passenger_gender: seat.passenger_gender
//     };
//   }

//   const seatMatrix = [];

//   for (let r = 1; r <= rows; r++) {
//     const row = [];

//     for (let c = 0; c < columns; c++) {
//       const letter = String.fromCharCode(65 + c); // A, B, C...
//       const number = `${r}${letter}`;

//       const seat = {
//         number,
//         status: bookedMap[number]?.status || 'available',
//         ...(bookedMap[number] || {})
//       };

//       row.push(seat);
//     }

//     seatMatrix.push(row);
//   }

//   return seatMatrix;
// };

// module.exports = formatSeats;
