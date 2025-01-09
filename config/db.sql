CREATE TABLE Users (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('admin', 'caretaker') NOT NULL,
    DateAdded TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Tenants (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(255) NOT NULL,
    LastName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Rent DECIMAL(10, 2) NOT NULL,
    Phone VARCHAR(20),
    RoomNumber VARCHAR(50)
);

CREATE TABLE Current_Month_Rent (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    TenantID INT NOT NULL,
    Rent DECIMAL(10, 2) NOT NULL,
    RentPaid DECIMAL(10, 2) NOT NULL DEFAULT 0,
    RentDue DECIMAL(10, 2) NOT NULL,
    MonthDue VARCHAR(50) NOT NULL,
    FOREIGN KEY (TenantID) REFERENCES Tenants(ID) ON DELETE CASCADE
);

CREATE TABLE Past_Due_Rent (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    TenantID INT NOT NULL,
    TotalRent DECIMAL(10, 2) NOT NULL,
    RentPaid DECIMAL(10, 2) NOT NULL DEFAULT 0,
    RentDue DECIMAL(10, 2) NOT NULL,
    Month VARCHAR(50) NOT NULL,
    FOREIGN KEY (TenantID) REFERENCES Tenants(ID) ON DELETE CASCADE
);

CREATE TABLE Payments_Made (
    PaymentID INT NOT NULL,
    TenantID INT NOT NULL,
    Amount INT NOT NULL,
    PaymentType ENUM ('standard', 'overdue') NOT NULL,
    PaymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

);


CREATE TABLE Activity_Log (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    UserID VARCHAR NOT NULL,
    ActivityType ENUM ('user_registration', 'user_deletion', 'payment', 'payment_data_deletion','overdue_pay_deletion') NOT NULL,
    RelevantID INT,
    ActivityDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE,

)

