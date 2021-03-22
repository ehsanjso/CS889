# Mac Instructions (Catalina onwards)

## Install MongoDB
`brew tap mongodb/brew`

`brew install mongodb-community`

`sudo mkdir -p /System/Volumes/Data/data/db`

```sudo chown -R `id -un` /System/Volumes/Data/data/db```

## Install and Open MongoDB Compass
link: https://www.mongodb.com/try/download/compass


## Run website locally
`cd backend`

`npm i`

`cd frontent`

`yarn add @craco/craco`

`npm i`

`mongod`

`cd backend`

`npm run start`

`cd frontend`

`npm run start`

## Sign up

1. Wait for the website to finish loading in `localhost:3000`
2. Sign up for an account 
3. Open MongoDB Compass
4. Click 'Connect'
5. Choose the 'cs889' database
6. Click 'users'
7. Set `isAdmin` and `isVerified` to `true` for your account
8. Click 'Update'
9. Reload the website




