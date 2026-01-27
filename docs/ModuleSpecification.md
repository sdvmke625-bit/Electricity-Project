# Module Specification

## 1. Input Module (Frontend/Routes)
**Module Name:** Input Handler
**Input:** 
- Consumer Reference ID
- Units Consumed
- Consumer Details (during registration): Name, Phone, Address, Connection Type

**Preconditions:**
- Database connection must be active.
- Server must be running.

**Logic:**
1. Accept data from HTTP POST request.
2. Sanitize inputs (trim whitespace).
3. Pass data to Validation Module.

**Output:** 
- JSON object or HTTP response with success/error message.

## 2. Validation Module (Models/Routes)
**Module Name:** Data Validator
**Input:** 
- Raw user data (Name, Phone, Units, Reference ID)

**Preconditions:**
- Data received from Input Module.

**Logic:**
- **Name:** Check if contains only alphabets (`/^[A-Za-z\s]+$/`).
- **Phone:** Check if exactly 10 digits (`/^\d{10}$/`).
- **Units:** Check if non-negative number.
- **Reference ID:** Check for uniqueness in Database.
- **Duplicate Bill:** Check if bill already exists for current month/year.

**Output:**
- Boolean (True/False) or Error Message string.

## 3. Computation Module (Bill Calculator)
**Module Name:** Bill Calculator
**Input:**
- Units Consumed (Integer)

**Preconditions:**
- Units must be validated (non-negative).

**Logic (Algorithm):**
```
FUNCTION calculateBill(units)
    IF units == 0 THEN
        RETURN { bill: 25, fine: 150 }
    
    bill = 0
    remaining = units
    
    IF remaining > 0 THEN
        slab = MIN(remaining, 50)
        bill = bill + (slab * 1.5)
        remaining = remaining - slab
    
    IF remaining > 0 THEN
        slab = MIN(remaining, 50)
        bill = bill + (slab * 2.5)
        remaining = remaining - slab
        
    IF remaining > 0 THEN
        slab = MIN(remaining, 50)
        bill = bill + (slab * 3.5)
        remaining = remaining - slab
        
    IF remaining > 0 THEN
        bill = bill + (remaining * 4.5)
        
    RETURN { bill: bill, fine: 150 }
END FUNCTION
```

**Output:**
- Bill Object `{ billAmount, units, fine, totalWithFine }`

## 4. Output Module (Response Handler)
**Module Name:** Bill Generator/Display
**Input:**
- Calculated Bill Data
- Consumer Details
- Due Date

**Logic:**
1. Format currency (2 decimal places).
2. Format dates.
3. Construct HTML response.
4. Display Pending Dues if any.

**Output:**
- Final HTML Page showing Bill Details.
