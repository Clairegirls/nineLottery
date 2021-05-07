// 初始化 Vue 实例
new Vue({
    el: '#app',
    data: {
        default_url: api,
        ajaxData:{
            uid: getQueryString("uid"),
            token: getQueryString("token"),
            lang: getQueryString("lang")
        },
        render:{},
        lottery:{},
        tasklist:[],
        prizelist:[],
        userlist:[],
        mylang:'zh',
        turnType:true,
        pageData:{},
        award:{},
        location:0//获奖位置
    },
    created:function() {
        this.Lang()
        // $('#gift0').addClass("aa")
        this.getRender()
    },
    methods: {
        Lang(){
            if (this.ajaxData.lang === "zh-CN" || this.ajaxData.lang === "zh-TW"){
                this.mylang = "zh";
            } else {
                this.mylang = "en";
            }
            $.ajax({
                type: "GET",
                url: "lang/" + this.mylang + ".json?v1",
                success: function (json) {
                    this.pageData = json;
                }.bind(this)
            });
        },
        closeDialog(){
            $('#shade_box').css('display','none')
            // $('#gift'+this.location).removeClass("aa");//清除上次中奖记录
            // $('#gift0').addClass("aa")
            // for(let i=1;i<8;i++){ //清除其他选中状态
            //     $('#gift'+i).removeClass("aa")
            // }
            this.turnType=true
        },
        turnStart(){
            this.turnType=false
            //清除上次中奖记录
            $('.aa').removeClass("aa")
            let that = this
            this.getLottery(function(){

                console.log('that.location')
                console.log(that.location)
                let num=6;      //奖品序号
                // let times=parseInt(Math.random()*(30-18+1)+18,10);
                let times = 16 + that.location
                let time=0;     //当前的旋转次数
                let speed=100;  //转盘速度
                console.log('num1'+num)
                num=0;
                timer = setInterval(function(){
                    $('#gift'+num).addClass("aa")
                    $('#gift'+(num-1)).removeClass("aa")
                    num++
                    if(num>7){
                        $('#gift7').removeClass("aa")
                        num = 0
                    }
                    time++;
                    console.log('time'+time)
                    console.log('times'+times)
                    if(time>times){//抽中
                        clearInterval(timer);
                        console.log('抽中')
                        console.log('that.location')
                        console.log(that.location)
                        $('#shade_box').css('display','flex')//抽奖弹框
                        $('#gift'+that.location).addClass("aa");
                        that.turnType=true;
                    }
                },speed)

            })

            //抽奖

            // console.log(that.location)
            // let num=3;      //奖品序号
            // // let times=parseInt(Math.random()*(30-18+1)+18,10);
            // let times = 16 + that.location
            // let time=0;     //当前的旋转次数
            // let speed=100;  //转盘速度
            // console.log('num1'+num)
            // num=0
            // timer = setInterval(function(){
            //     $('#gift'+num).addClass("aa")
            //     $('#gift'+(num-1)).removeClass("aa")
            //     num++
            //     if(num>7){
            //         $('#gift7').removeClass("aa")
            //         num = 0
            //     }
            //     time++;
            //     console.log('time'+time)
            //     console.log('times'+times)
            //     if(time>times){//抽中
            //         clearInterval(timer);
            //         console.log('抽中')
            //         $('#shade_box').css('display','flex')//抽奖弹框
            //     }
            // },speed)
        },
        getRender:function(){
            var that = this
            $.ajax({
                url: that.default_url + "/events/sprice/render",
                type: "GET",
                data: that.ajaxData,
                dataType: "jsonp",
                success: function(data) {
                    console.log(data);
                    if(data.result==1){
                        that.render = data.data
                        that.userlist = data.data.userlist
                        that.prizelist = data.data.prizelist
                        that.prizelist.forEach((item,index)=>{
                            if(index<3){
                                item.turnId = index
                            }else if(index==3){
                                item.turnId = 7
                            }else if(index==4){
                                item.turnId = 3
                            }else if(index==5){
                                item.turnId = 6
                            }else if(index==6){
                                item.turnId = 5
                            }else if(index==7){
                                item.turnId = 4
                            }
                        })
                        that.tasklist = data.data.tasklist
                        that.render.task_tips_status = data.data.task_tips_status
                        console.log(that.prizelist)
                        console.log(data.data)
                    }else{
                        alert(data.msg)
                    }
                }
            })
        },
        // POST 抽奖
        getLottery:function(callback){
            var that = this
            $.ajax({
                url: that.default_url + "/events/sprice/lottery",
                type: "GET",
                data: that.ajaxData,
                dataType: "jsonp",
                success: function(data) {
                    console.log('data.data')
                    console.log(data.data)
                    if(data.result==1){
                        console.log(data.data)
                        that.award = data.data
                        that.render.current_coin=data.data.current_coin;
                        // that.prizelist在奖品列表里通过奖品id查询到奖品所在位置
                        for(let i=0;i<that.prizelist.length-1;i++){
                            if(data.data.id==that.prizelist[i].id){
                                that.location = that.prizelist[i].turnId
                                // return true;
                            }
                        }
                        typeof callback=="function" && callback();
                    }else{
                        alert(data.msg)
                        that.turnType=true;
                    }
                }
            })
        },
        // POST 领取任务
        getTask:function(taskid){
            var that = this
            that.taskid = taskid
            that.ajaxData.taskid=taskid;
            $.ajax({
                url: that.default_url + "/events/sprice/receivetask",
                type: "GET",
                data: that.ajaxData,
                dataType: "jsonp",
                success: function(data) {
                    if(data.result==1){
                        $('#tips').css('display','flex')
                        setTimeout(function(){
                            $('#tips').css('display','none')
                        },2000)
                        // 领取之后刷新数据
                        that.getRender()
                        console.log(data)
                    }else{
                        alert(data.msg)
                    }
                }
            })
        },
        //开始抽奖
        startLottery:function () {
            if((this.render.current_coin>=200&&this.turnType)){
                this.turnStart();
                return;
            }
            alert(this.pageData.insufficient_star);
        }

    }
});
