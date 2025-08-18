# ogcamping
#!/bin/bash

# 1. Giải nén file fontend.zip
unzip fontend.zip -d ./fontend

# 2. Di chuyển vào thư mục dự án React
cd fontend

# 3. Cài đặt node_modules
npm install --legacy-peer-deps

# 4. chạy dự án React
npm run dev 
