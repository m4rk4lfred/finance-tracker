COPY NALANG MGA TO SA FOLDER NG TEMPLATE TAS REPLACE NIYO YUNG NANDON hen magcreate ng database sa sql

CREATE DATABASE DATABASE_PROJECT;

        CREATE TABLE transactions(
        
                id INT PRIMARY KEY,
                
                amount INT NOT NULL,
                
                type VARCHAR(50) NOT NULL,
                
                name VARCHAR(100) NOT NULL,
                
                date DATE NOT NULL
        
        );

        ALTER TABLE TRANSACTIONS
        
        MODIFY id INT AUTO_INCREMENT;
