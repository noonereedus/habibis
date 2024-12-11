import {useState, useEffect} from 'react'

//Makes a backend request to access the grocery list
function SharedOrder() {

    const [products, setProducts] = useState([]);
    useEffect(() => {
        fetch("http://localhost:3000/api/products")
        .then(res => res.json())
        .then(products => 
            setProducts(products))
    }, []
)

//Produces HTML layout to display the website nodes
return (
    <div><h1> Shared Order</h1>
    <h2>Does anything change when I commit?..</h2>
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