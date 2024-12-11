import {useState} from 'react'

//Makes a backend request to join an existing order or create a new order
function MainPage() {

    const [createCode, setCode] = useState('');
    const [error, setError] = useState('');
    const createOrder = () => {
        fetch("http://localhost:3000/api/order/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ studentId: "2545776" }), //need to read id later
        })
        .then(res => res.json())
        .then(code => 
            setCode(code.uniqueCode))
        .catch((error) => { 
            console.error("Error while creating and order:", error); setError("Something went wrong! Order not created :(");
        });
    };

//Produces the HTML layout to allow joining/creating an order
return (
    <div><h1>Welcome to Shared Groceries by SSH</h1>

    {/*Order creation button*/}
    <button onClick={createOrder}>Create a shared order</button>
    {createCode && 
    (
    <p>This is your new order code. Dont lose it: <strong>{createCode}</strong></p>
    )}

    {/*error scenario*/}
    {error && 
    (<p class="error">{error}</p>
    )}

    </div>
    
);

}
export default MainPage;