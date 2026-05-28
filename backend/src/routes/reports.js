const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports/doctor-stats
// Highly inefficient nested loop aggregate reporting for admin/receptionists dashboard
// PERFORMANCE BUG: Performs multiple nested DB queries inside a loop for every doctor.
// Runs sequentially, blocking/scaling terrible with doctors count.
router.get('/doctor-stats', authenticate, async (req, res) => {
  try {
    const start = Date.now();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Fetch all doctors along with their appointments and today's queue tokens in one single query
    const doctors = await prisma.doctor.findMany({
      include: {
        appointments: true,
        queueTokens: {
          where: {
            createdAt: { gte: today },
          },
        },
      },
    });

    const reportData = doctors.map((doc) => {
      const completedApps = doc.appointments.filter((a) => a.status === 'COMPLETED');
      const cancelledApps = doc.appointments.filter((a) => a.status === 'CANCELLED');

      return {
        id: doc.id,
        name: doc.name,
        specialization: doc.specialization,
        department: doc.department,
        totalAppointments: doc.appointments.length,
        completedAppointments: completedApps.length,
        cancelledAppointments: cancelledApps.length,
        todayQueueSize: doc.queueTokens.length,
        revenue: completedApps.length * doc.consultationFee,
      };
    });

    const durationMs = Date.now() - start;

    res.json({
      success: true,
      timeTakenMs: durationMs,
      data: reportData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
