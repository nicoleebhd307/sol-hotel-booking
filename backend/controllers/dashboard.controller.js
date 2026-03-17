const Booking = require('../models/Booking');
const Room = require('../models/Room');

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getCount(docs) {
  if (!Array.isArray(docs) || docs.length === 0) {
    return 0;
  }
  return Number(docs[0].count) || 0;
}

function calcGrowth(current, previous) {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

async function getReceptionistDashboard(req, res) {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = addDays(todayStart, 1);
    const yesterdayStart = addDays(todayStart, -1);

    const roomStringProjection = {
      $let: {
        vars: {
          numbers: {
            $map: {
              input: '$roomDocs',
              as: 'room',
              in: '$$room.room_number'
            }
          }
        },
        in: {
          $reduce: {
            input: '$$numbers',
            initialValue: '',
            in: {
              $cond: [
                { $eq: ['$$value', ''] },
                '$$this',
                { $concat: ['$$value', ', ', '$$this'] }
              ]
            }
          }
        }
      }
    };

    const bookingsPipeline = [
      {
        $facet: {
          totalBookingsToday: [
            { $match: { createdAt: { $gte: todayStart, $lt: tomorrowStart } } },
            { $count: 'count' }
          ],
          totalBookingsYesterday: [
            { $match: { createdAt: { $gte: yesterdayStart, $lt: todayStart } } },
            { $count: 'count' }
          ],
          checkInToday: [
            {
              $match: {
                check_in: { $gte: todayStart, $lt: tomorrowStart },
                status: { $ne: 'cancelled' }
              }
            },
            { $count: 'count' }
          ],
          checkInYesterday: [
            {
              $match: {
                check_in: { $gte: yesterdayStart, $lt: todayStart },
                status: { $ne: 'cancelled' }
              }
            },
            { $count: 'count' }
          ],
          checkOutToday: [
            {
              $match: {
                check_out: { $gte: todayStart, $lt: tomorrowStart },
                status: { $ne: 'cancelled' }
              }
            },
            { $count: 'count' }
          ],
          checkOutYesterday: [
            {
              $match: {
                check_out: { $gte: yesterdayStart, $lt: todayStart },
                status: { $ne: 'cancelled' }
              }
            },
            { $count: 'count' }
          ],
          checkins: [
            {
              $match: {
                check_in: { $gte: now },
                status: { $in: ['pending', 'confirmed', 'checked_in'] }
              }
            },
            { $sort: { check_in: 1 } },
            {
              $lookup: {
                from: 'customers',
                localField: 'customer_id',
                foreignField: '_id',
                as: 'customer'
              }
            },
            {
              $lookup: {
                from: 'rooms',
                localField: 'rooms.room_id',
                foreignField: '_id',
                as: 'roomDocs'
              }
            },
            {
              $project: {
                _id: 0,
                bookingId: { $toString: '$_id' },
                customerName: { $ifNull: [{ $arrayElemAt: ['$customer.name', 0] }, 'Unknown'] },
                room: roomStringProjection,
                time: {
                  $dateToString: {
                    format: '%H:%M',
                    date: '$check_in'
                  }
                }
              }
            }
          ],
          checkouts: [
            {
              $match: {
                check_out: { $gte: now },
                status: { $ne: 'cancelled' }
              }
            },
            { $sort: { check_out: 1 } },
            {
              $lookup: {
                from: 'customers',
                localField: 'customer_id',
                foreignField: '_id',
                as: 'customer'
              }
            },
            {
              $lookup: {
                from: 'rooms',
                localField: 'rooms.room_id',
                foreignField: '_id',
                as: 'roomDocs'
              }
            },
            {
              $project: {
                _id: 0,
                bookingId: { $toString: '$_id' },
                customerName: { $ifNull: [{ $arrayElemAt: ['$customer.name', 0] }, 'Unknown'] },
                room: roomStringProjection,
                status: {
                  $cond: [
                    { $in: ['$status', ['checked_out', 'completed']] },
                    'paid',
                    'pending'
                  ]
                }
              }
            }
          ]
        }
      }
    ];

    const roomsPipeline = [
      { $match: { is_active: true } },
      {
        $lookup: {
          from: 'room_types',
          localField: 'room_type_id',
          foreignField: '_id',
          as: 'roomType'
        }
      },
      {
        $unwind: {
          path: '$roomType',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$room_type_id',
          roomType: { $first: { $ifNull: ['$roomType.name', 'Unknown'] } },
          total: { $sum: 1 },
          occupied: {
            $sum: {
              $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0]
            }
          },
          available: {
            $sum: {
              $cond: [{ $eq: ['$status', 'available'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          roomType: 1,
          total: 1,
          available: 1,
          occupiedPercent: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      { $eq: ['$total', 0] },
                      0,
                      { $divide: ['$occupied', '$total'] }
                    ]
                  },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { roomType: 1 } }
    ];

    const [bookingFacets, roomRows] = await Promise.all([
      Booking.aggregate(bookingsPipeline),
      Room.aggregate(roomsPipeline)
    ]);

    const facets = bookingFacets[0] || {};

    const totalBookingsToday = getCount(facets.totalBookingsToday);
    const totalBookingsYesterday = getCount(facets.totalBookingsYesterday);
    const checkInToday = getCount(facets.checkInToday);
    const checkInYesterday = getCount(facets.checkInYesterday);
    const checkOutToday = getCount(facets.checkOutToday);
    const checkOutYesterday = getCount(facets.checkOutYesterday);

    const availableRooms = roomRows.reduce((sum, row) => sum + (row.available || 0), 0);

    const estimatedAvailableYesterday = Math.max(
      0,
      availableRooms + checkInToday - checkOutToday
    );

    const payload = {
      stats: {
        totalBookingsToday,
        checkInToday,
        checkOutToday,
        availableRooms,
        growth: {
          bookings: calcGrowth(totalBookingsToday, totalBookingsYesterday),
          checkIn: calcGrowth(checkInToday, checkInYesterday),
          checkOut: calcGrowth(checkOutToday, checkOutYesterday),
          rooms: calcGrowth(availableRooms, estimatedAvailableYesterday)
        }
      },
      roomAvailability: roomRows.map((row) => ({
        roomType: row.roomType,
        occupiedPercent: row.occupiedPercent
      })),
      checkins: facets.checkins || [],
      checkouts: facets.checkouts || []
    };

    return res.json(payload);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to load receptionist dashboard data'
    });
  }
}

module.exports = {
  getReceptionistDashboard
};
