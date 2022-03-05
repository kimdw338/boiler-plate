const express = require('express');
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { User } =require("./models/User");
const mongoose = require('mongoose')
const config =require('./config/key')
mongoose.connect(config.mongoURI).then(()=> console.log('MongoDB Connected...'))
.catch(err=> console.log(err))

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
//application/json
app.use(bodyParser.json());
app.use(cookieParser());
app.get('/', (req,res) => res.send('Hello World!~ 많이 사랑해 새해복 많이 받으세요'))


app.post('/register',(req, res)=>{
    //회원 가입할 때 필요 정보들을 client에서 가져오면 
    //그것들을 데이터 베이스에 넣어준다.
    
    const user = new User(req.body)

    user.save((err, userInfo)=>{
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/login',(req, res)=>{
    //요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({ email: req.body.email },(err, user)=>{
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            });
        }
        // 요청된 E-mail이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
        
        //비밀번호까지 같다면 유저를 위한 Token을 생성해야 한다.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) return res.json({loginSuccess: false, message:"비밀번호가 틀렸습니다."});
    
            user.generateToken((err,user) => {
                if(err) return res.status(400).send(err);
                // 토큰을 저장한다. 어디에 ? 쿠키, 로컬 스토리지
                res.cookie("x_auth", user.token)
                .status(200)
                .json({loginSuccess : true, userId:user._id})
            
            });
        });
    });
});


app.listen(port, ()=> console.log(`Example app listening on port ${port}!`))