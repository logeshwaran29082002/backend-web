const bcrypt = require('bcrypt')


// 2 hashpassword
const hashpassword = async (password)=>{
   return await bcrypt.hash(password,10);
}



module.exports=hashpassword