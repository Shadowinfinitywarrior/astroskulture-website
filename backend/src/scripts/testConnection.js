import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing MongoDB Connection...\n');
console.log('Connection String:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
console.log('Database User:', 'teamastros404_db_user');
console.log('Database Name:', 'astromain\n');

const connectWithRetry = async () => {
    try {
        console.log('⏳ Attempting connection with 30 second timeout...');

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4
            dbName: 'astromain'
        });

        console.log('✅ Successfully connected to MongoDB!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        console.log('🏠 Host:', mongoose.connection.host);
        console.log('🔌 Connection State:', mongoose.connection.readyState);

        // Test a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📁 Available Collections:');
        collections.forEach(col => console.log(`   - ${col.name}`));

        // Count orders
        const Order = mongoose.connection.db.collection('orders');
        const orderCount = await Order.countDocuments();
        const paidOrderCount = await Order.countDocuments({ paymentStatus: 'paid' });

        console.log('\n📦 Order Statistics:');
        console.log(`   Total Orders: ${orderCount}`);
        console.log(`   Paid Orders: ${paidOrderCount}`);

        await mongoose.connection.close();
        console.log('\n✅ Connection test successful!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error:', error.message);
        console.error('Error Code:', error.code);
        console.error('Error Name:', error.name);

        if (error.message.includes('authentication')) {
            console.error('\n💡 Authentication issue - check username/password');
        } else if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
            console.error('\n💡 Network issue - possible causes:');
            console.error('   1. Firewall blocking MongoDB port (27017)');
            console.error('   2. VPN/Proxy interference');
            console.error('   3. DNS resolution issues');
            console.error('   4. MongoDB Atlas cluster paused/unavailable');
        }

        process.exit(1);
    }
};

connectWithRetry();
