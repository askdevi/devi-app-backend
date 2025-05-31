const express = require('express');
const router = express.Router();
const { getCompatibilityReport } = require('../../lib/astrology/compatibilityReport');
const { getFirebaseAdmin } = require('../../lib/firebase-admin');

router.post('/', async (req, res) => {
    try {
        const {
            userId,
            name,
            birthDate,
            birthTime,
            birthPlace,
        } = req.body;

        if (!userId || !name || !birthDate || !birthTime || !birthPlace || !birthPlace.name || !birthPlace.latitude || !birthPlace.longitude) {
            return res.status(400).json({ error: 'All fields are required' });
        }


        const { db } = getFirebaseAdmin();

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user_date = userData.birthDate;
        const user_time = userData.birthTime;
        const user_location = userData.birthPlace;
        const gender = userData.gender;

        let compatibilityReport1;

        if (gender === 'male') {
            compatibilityReport1 = await getCompatibilityReport({
                m_date: user_date,
                m_time: user_time,
                m_location: user_location,
                f_date: birthDate,
                f_time: birthTime,
                f_location: birthPlace,
            })
        }
        else {
            compatibilityReport1 = await getCompatibilityReport({
                m_date: birthDate,
                m_time: birthTime,
                m_location: birthPlace,
                f_date: user_date,
                f_time: user_time,
                f_location: user_location,
            })
        }

        compatibilityReport1 = compatibilityReport1.compatibilityReport;

        const compatibilityReport = {
            qualities: [
                {
                    title: 'Lifestyle Harmony',
                    total_points: compatibilityReport1.varna.total_points,
                    received_points: compatibilityReport1.varna.received_points,
                },
                {
                    title: 'Mutual Attraction',
                    total_points: compatibilityReport1.vashya.total_points,
                    received_points: compatibilityReport1.vashya.received_points,
                },
                {
                    title: 'Comfort - Prosperity - Health',
                    total_points: compatibilityReport1.tara.total_points,
                    received_points: compatibilityReport1.tara.received_points,
                },
                {
                    title: 'Intimate Bond',
                    total_points: compatibilityReport1.yoni.total_points,
                    received_points: compatibilityReport1.yoni.received_points,
                },
                {
                    title: 'Friendship',
                    total_points: compatibilityReport1.maitri.total_points,
                    received_points: compatibilityReport1.maitri.received_points,
                },
                {
                    title: 'Temperament',
                    total_points: compatibilityReport1.gan.total_points,
                    received_points: compatibilityReport1.gan.received_points,
                },
                {
                    title: 'Collective Growth',
                    total_points: compatibilityReport1.bhakut.total_points,
                    received_points: compatibilityReport1.bhakut.received_points,
                },
                {
                    title: 'Generational Bond',
                    total_points: compatibilityReport1.nadi.total_points,
                    received_points: compatibilityReport1.nadi.received_points,
                },
            ],
            total_points: compatibilityReport1.total.total_points,
            received_points: compatibilityReport1.total.received_points,
            report: compatibilityReport1.conclusion.report,
            name: name,
            birthDate: birthDate,
            birthTime: birthTime,
            birthPlace: birthPlace,
        }

        const collectionRef = db.collection('compatibilityReports');
        const compatibilityReportRef = collectionRef.doc(userId);
        const compatibilityReportDoc = await compatibilityReportRef.get();

        if (compatibilityReportDoc.exists) {
            await compatibilityReportRef.update({
                compatibilityReports: [
                    ...compatibilityReportDoc.data().compatibilityReports,
                    { name, birthDate, birthTime, birthPlace, qualities: compatibilityReport.qualities, total_points: compatibilityReport.total_points, received_points: compatibilityReport.received_points, report: compatibilityReport.report, createdAt: new Date() }
                ]
            });
        }
        else {
            await compatibilityReportRef.set({
                compatibilityReports: [
                    { name, birthDate, birthTime, birthPlace, qualities: compatibilityReport.qualities, total_points: compatibilityReport.total_points, received_points: compatibilityReport.received_points, report: compatibilityReport.report, createdAt: new Date() }
                ],
                userId: userId
            });
        }

        return res.status(200).json(compatibilityReport);
    }
    catch (error) {
        console.error('Compatibility Report API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;