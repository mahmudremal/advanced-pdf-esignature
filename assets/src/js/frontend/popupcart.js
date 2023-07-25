const popupCart = {
    basePrice: 0,
    priceSign: '$',
    additionalPrices: [],

    setBasePrice: (price) => {
        popupCart.basePrice = price;
    },
    addAdditionalPrice: (item, price) => {
        console.log('addAdditionalPrice...');
        const existingIndex = popupCart.additionalPrices.findIndex(p => p.item === item);
        if (existingIndex === -1) {
            popupCart.additionalPrices.push({ item, price });
        } else {
            // Item already exists, update the price
            popupCart.additionalPrices[existingIndex].price = price;
        }
        popupCart.updateTotalPrice();
    },
    removeAdditionalPrice: (item, price) => {
        console.log('removeAdditionalPrice...');
        const index = popupCart.additionalPrices.findIndex(item => item.item === itemName);
        if (index !== -1) {
            popupCart.additionalPrices.splice(index, 1);
        }
    },
    getTotalPrice: () => {
        const additionalPriceTotal = popupCart.additionalPrices.reduce((total, item) => total + item.price, 0);
        return (parseFloat(popupCart.basePrice) + parseFloat(additionalPriceTotal));
    },
    updateTotalPrice: () => {
        const prices = document.querySelector('.calculated-prices .price_amount .woocommerce-Price-currencySymbol');
        if(prices && prices.nextSibling) {
            prices.nextSibling.textContent = parseFloat(popupCart.getTotalPrice());
        }
    }
};
export default popupCart;