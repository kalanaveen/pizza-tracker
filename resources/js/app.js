import axios from 'axios';
import Noty from "noty";
import {initAdmin} from './admin';
import moment from 'moment';
import { initStripe } from './stripe';

let addToCart = document.querySelectorAll
('.add-to-cart');
let cartCounter = document.getElementById('cartCounter');

async function updateCart(pizzas) {
    try {
        const res = await axios.post('/update-cart', pizzas);
        cartCounter.innerText = res.data.total;
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'Item Added To Cart',
        }).show();
    } catch (err) {
        new Noty({
            type: "warning",
            timeout: 1000,
            text: "Something went wrong",
        }).show();
    }
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let pizzas = btn.dataset.pizza;
        updateCart(pizzas);
    });
});

const alertMsg = document.querySelector('#success-alert');
if(alertMsg){
    setTimeout(() => {
        alertMsg.remove();
    }, 5000);
}


//change order status
let status = document.querySelectorAll('.status_line');
let hiddenInput = document.getElementById('hiddenInput');
let order = hiddenInput ? hiddenInput.value : null ;
order = JSON.parse(order);
let time = document.createElement('small')

function updateStatus(order){
    status.forEach((sta)=>{
        sta.classList.remove('step-completed')
        sta.classList.remove('current')
    })
    let stepCompleted = true;
    status.forEach((sta)=>{
          let dataProp = sta.dataset.status;
          if(stepCompleted){
              sta.classList.add('step-completed')
          }
          if(dataProp === order.status){
              stepCompleted = false
              time.innerText = moment(order.updatedAt).format('hh:mm A')
              sta.appendChild(time)
              if(sta.nextElementSibling){
                  sta.nextElementSibling.classList.add('current')
              }
          }
    })
}

updateStatus(order);
initStripe();

// socket side 
let socket = io()


//join
if(order){
    socket.emit('join',`order_${order._id}`)
}

let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')){
    initAdmin(socket)
    socket.emit('join','adminRoom')
}
socket.on('orderUpdated',(data)=>{
    const updatedOrder = {...order}
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder);
    new Noty({
        type:'success',
        timeout:1000,
        text:'Order Updated',
      }).show();
})