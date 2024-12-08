import {useState, useEffect} from 'react'

function SharedOrder() {

    const [products, setBasket] = useState([]);
    useEffect(() => {
        fetch("http://localhost:3000/products")
        .then(res => res.json())
        .then(products => setBasket(products))
    }, []
)

return (
    <div><h1> Shared Order</h1>
    <ul>
        {products.map((product) => (
            <li>{product.name}: {product.price}</li>
        ))}
    </ul>
    </div>
    
);

}
export default SharedOrder;