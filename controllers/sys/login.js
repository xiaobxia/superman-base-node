/**
 * Created by xiaobxia on 2017/6/23.
 */
module.exports = {
    method: 'get',
    api: 'sys/login',
    response: function (req, res) {
        console.log(req.query)
        console.log(req.method)
        console.log(req.session);
        req.session.regenerate(
            function(err) {
                if(err){
                    return res.json({ret_code: 2, ret_msg: '登录失败'});
                }
                req.session.loginUser = '11';
                res.json({ret_code: 0, ret_msg: '登录成功'});
            }
        )
    }
}