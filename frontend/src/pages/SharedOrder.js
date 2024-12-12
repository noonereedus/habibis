import {useState, useEffect} from 'react'


const backendURL = "https://habibis-backend.onrender.com"; // Backend URL
//const backendURL = "http://localhost:3000"; //or local testing


//Makes a backend request to access the grocery list
function SharedOrder() {


   const [products, setProducts] = useState([]);
   const [students, setStudents] = useState([]);
   const [accountID, setAccountID] = useState("2644476");
   const [joinCode, setJoinCode] = useState("");
   const [orderID, setOrderID] = useState(null);
   const [orderInfo, setOrderInfo] = useState(null);
   useEffect(() => {


       //Our function that retrieves all needed info from the backend on page load
       const fetchAll =  () => {


           //if you want to add more functions without me, this is the essential part
           //above you add const [valueName, setValueName] = useState(type);
           //then here you fetch(`${backendURL}/api/whatever endpoint you want to access
           //copy the lines and substitute setProducts with setYourValue
           //congrats! your data has been fetched
           fetch(`${backendURL}/api/products`)
               .then(res => res.json())
               .then(products =>
           setProducts(products))




           fetch(`${backendURL}/api/students`)
           .then(res => res.json())
               .then(students =>
           setStudents(students))
       };
       fetchAll();
     }, []);
  
     //gets us an order? it's the most straughtforward name and the shortest function
     const getOrderInfo = (orderID) =>
       {
           fetch(`${backendURL}/api/order/${orderID}/summary`)
           .then(res => res.json())
           .then(response =>
       setOrderInfo(response))
     }


   //this processes the Join order button
   const joinOrder = (event) =>
   {
       event.preventDefault(); //basically doesn't allow empty input
       fetch(`${backendURL}/api/order/join`,{
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ studentId: accountID, uniqueCode: joinCode }),
       }
   )
   .then(res => res.json())
               .then(response => {
           setOrderID(response.orderId);
           getOrderInfo(response.orderId);
               }
           )


   }




//Produces HTML layout to display the website nodes
return (
   <div>
       <h1> Shared Order</h1>


{
   //If we do not have an order id, a button for joining order is rendered
   //(here it's a form, not a button, because that's what react documentation suggested)
   //doesn't really matter. It's a "Join order" button. It joins you to an order
}
   {!orderID && ( <div>
       <form onSubmit={joinOrder}>
   <label for="join">Join an existing order:</label>
   <input onChange={(e) => setJoinCode(e.target.value)} type="text" id="join" name="join"/>
   <button type="submit">Join</button>
   </form>
</div>)}
  
   {
       //If we do have orderID, all of the info is fetched and rendered on the page
   }
   {orderID && (
   <div>
      
   <h2>Student list:</h2>
   <ul>
       {orderInfo.students.map((stud) => (
           <li>{stud.student_name}: {stud.individual_total}, Delivery fee {stud.delivery_fee_share}; Paid: {stud.payment_status}</li>
       ))}
   </ul>


   <h2>Product list:</h2>
   <ul>
       {products.length === 0 && (
           <><h2>No products here :(</h2></>)}
       {products.map((product) => (
           <li>{product.name}: {product.price}</li>
       ))}
   </ul>
   <h3>Total: {orderInfo.total_cost}</h3>
   </div>
   )}
   </div>
  
);


}
export default SharedOrder;



