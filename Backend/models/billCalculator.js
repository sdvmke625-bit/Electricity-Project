function calculateBillAmount(units) {
    if (units === 0) {
        return {
            billAmount: 25,
            units: 0,
            fine: 150,
            totalWithFine: 25 + 150
        };
    }

    let bill = 0;
    let remainingUnits = units;

    if (remainingUnits > 0) {
        const slab = Math.min(remainingUnits, 50);
        bill += slab * 1.5;
        remainingUnits -= slab;
    }

    if (remainingUnits > 0) {
        const slab = Math.min(remainingUnits, 50);
        bill += slab * 2.5;
        remainingUnits -= slab;
    }

    if (remainingUnits > 0) {
        const slab = Math.min(remainingUnits, 50);
        bill += slab * 3.5;
        remainingUnits -= slab;
    }

    if (remainingUnits > 0) {
        bill += remainingUnits * 4.5;
    }

    return {
        billAmount: bill,
        units: units,
        fine: 150,
        totalWithFine: bill + 150
    };
}

module.exports = { calculateBillAmount };
