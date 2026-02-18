# 1. Use a specific version for stability
FROM node:24-slim

# 2. Enable Corepack to ensure the correct Yarn version is used
RUN corepack enable

# 3. Create a dedicated app directory
WORKDIR /usr/app

# 4. Copy ONLY package files first (The "Cache Trick")
COPY package.json yarn.lock ./

# 5. Install dependencies 
# This layer is cached unless you change package.json/yarn.lock
RUN yarn install --frozen-lockfile

# 6. Now copy the rest of your source code
COPY . .

# 7. Start the app
CMD ["yarn", "start"]