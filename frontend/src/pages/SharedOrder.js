import {useState, useEffect} from 'react'

const backendURL = "https://habibis-backend.onrender.com"; // Backend URL

//Makes a backend request to access the grocery list
function SharedOrder() {

    const [products, setProducts] = useState([]);
    useEffect(() => {
        fetch(`${backendURL}/api/products`)
        .then(res => res.json())
        .then(products => 
            setProducts(products))
    }, []
)

//Produces HTML layout to display the website nodes
return (
    <div><h1> Shared Order</h1>
    <ul>
        {products.length === 0 && (
            <><h2>The backend server is hosted locally.</h2><h3>If the space below is empty,
                    please clone the repository, run "node src/index.js" in terminal and reload this page</h3></>)}
        {products.map((product) => (
            <li>{product.name}: {product.price}</li>
        ))}
    </ul>
    </div>
    
);

}
export default SharedOrder;