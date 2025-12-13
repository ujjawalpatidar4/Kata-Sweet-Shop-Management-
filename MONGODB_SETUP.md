# MongoDB Setup Guide for Sweet Shop Project

## Option 1: Install MongoDB Locally (Recommended for Learning)

### For Windows:

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Select Windows
   - Download the .msi installer

2. **Install MongoDB**
   - Run the downloaded .msi file
   - Choose "Complete" installation
   - Install MongoDB as a Service (check the box)
   - Install MongoDB Compass (optional GUI tool)

3. **Verify Installation**
   ```powershell
   mongod --version
   ```

4. **Start MongoDB Service**
   ```powershell
   net start MongoDB
   ```

5. **Update .env file**
   ```
   MONGODB_URI=mongodb://localhost:27017/sweet-shop
   ```

## Option 2: Use MongoDB Atlas (Cloud - Easier, No Installation)

### Steps:

1. **Create Free Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select a cloud provider and region close to you
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" in left menu
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `sweetshop_user`
   - Password: Create a strong password (save it!)
   - User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development only!)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in left menu
   - Click "Connect" button on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

6. **Update .env file**
   ```
   MONGODB_URI=mongodb+srv://sweetshop_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sweet-shop?retryWrites=true&w=majority
   ```
   Replace:
   - `YOUR_PASSWORD` with the password you created
   - `cluster0.xxxxx` with your actual cluster address
   - `/sweet-shop` is the database name

## Testing the Connection

After setting up MongoDB (either option), test your connection:

```powershell
cd backend
npm run dev
```

You should see: "MongoDB Connected: ..."

## For Running Tests

The tests will automatically create a test database. Just make sure MongoDB is running (local) or your Atlas connection is configured.

## Troubleshooting

### MongoDB Won't Start (Local)
- Check if port 27017 is already in use
- Try restarting the MongoDB service
- Check Windows Services to see if MongoDB is running

### Can't Connect to Atlas
- Double-check your username and password in the connection string
- Make sure you've whitelisted your IP address
- Wait a few minutes after creating the cluster (it takes time to set up)

### Connection Timeout
- Check your internet connection (for Atlas)
- Verify the connection string is correct
- Check firewall settings

## Next Steps

Once MongoDB is running, you can proceed with:
1. Running the backend tests: `npm test`
2. Starting the development server: `npm run dev`
3. Continuing with frontend development
