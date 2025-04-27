
CREATE TABLE Tenants (
    TenantID SERIAL PRIMARY KEY, -- Auto-incrementing ID
    FirstName TEXT NOT NULL,
    LastName TEXT NOT NULL, -- Fixed `LastNameT` typo
    Email TEXT UNIQUE NOT NULL CHECK (Email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    Rent DECIMAL(10,2) NOT NULL,
    Phone VARCHAR(20) UNIQUE NOT NULL, -- Fixed UNIQUE placement
    RoomNumber VARCHAR(50) UNIQUE -- Fixed UNIQUE placement
);


CREATE TABLE Current_Month_Due (
    CurrentMonthDueID SERIAL PRIMARY KEY,
    TenantID INT NOT NULL,
    WaterBill DECIMAL(10, 2) NOT NULL,
    GarbageBill DECIMAL(10, 2) NOT NULL,
    AmountPaid DECIMAL(10, 2) NOT NULL DEFAULT 0,
    MonthDue VARCHAR(50) NOT NULL,
    FOREIGN KEY (TenantID) REFERENCES Tenants(TenantID) ON DELETE CASCADE
);

CREATE TABLE Overdue_Pay_Instance (
    OverduePayID SERIAL PRIMARY KEY,
    TenantID INT NOT NULL,
    WaterBill DECIMAL(10, 2) NOT NULL,
    GarbageBill DECIMAL(10, 2) NOT NULL,
    AmountPaidByDelay DECIMAL(10, 2) NOT NULL,
    AmountPaid DECIMAL(10, 2) NOT NULL,
    MonthDue VARCHAR(50) NOT NULL,
    FOREIGN KEY (TenantID) REFERENCES Tenants(TenantID) ON DELETE CASCADE
);


CREATE TABLE OverduePayments (
    OvdPaymentID SERIAL PRIMARY KEY,
    OverduePayID INT NOT NULL,
    TenantID INT NOT NULL,
    AmountPaid DECIMAL(10, 2) NOT NULL,
    PaymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TenantID) REFERENCES Tenants(TenantID) ON DELETE CASCADE,
    FOREIGN KEY (OverduePayID) REFERENCES Overdue_Pay_Instance(OverduePayID) ON DELETE CASCADE
);



CREATE TABLE Activity_Log (
    ActivityID SERIAL PRIMARY KEY,
    UserID INT,
    ActivityType TEXT NOT NULL CHECK (ActivityType IN (
        'user_registration', 'user_deletion', 'standard_payment',
        'overdue_payment', 'standard_pay_deletion', 'overdue_pay_deletion',
        'monthly_refresh'
    )),
    RelevantID INT,
    ActivityDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE
);
