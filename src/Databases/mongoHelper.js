const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = class {
    static async connect () {
        await mongoose.connect(process.env.MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: true,
            useCreateIndex: true
        }, (err) => {
            if(err) {
                console.err(err);
            }else{
                console.clear();
                console.info('- MongoDB connected.')
            }
        });
    }

    static async disconnect(){
        await mongoose.disconnect();
    }

    static getMongoose(){
        return mongoose;
    }
}