function cartController() {
    return{
        index(req,res){
             res.render('customers/cart');
        },
        update(req,res){
            // for firt time craeting cart and adding basic object structure
            if(!req.session.cart){
                req.session.cart = {
                    items:{},
                    totalQty:0,
                    totalPrice:0
                }
            }
            let cart = req.session.cart
            let response = JSON.parse(Object.keys(req.body));
            // check if item does not exist in cart
            if(!cart.items[response._id]){
                cart.items[response._id] = {
                    item:response,
                    qty:1,
                 }
                 cart.totalQty = cart.totalQty + 1
                 cart.totalPrice = cart.totalPrice + response.price
            }else{
                cart.items[response._id].qty = cart.items[response._id].qty  + 1
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice = cart.totalPrice + response.price
            }
            return res.json({total:req.session.cart.totalQty});
        }
    }
  }
  
  module.exports = cartController;
  