				APPLICATION’ S DESCRIPTION 
Criteria for Evaluation:
Multi-screen application
State Management 
User input + Event 
Business Logic + Local Data Storage 
Clean Code

Main Logic:
After login, the screen will pass through the coffee shop’s introduction page before reaching the main menu page. 

Main menu page: 
Profile button: On the up right corner, where show the personal information(DOB, Name, phone number, email and address) and a button on each line of information for user to modify.
Menu: Lies on the center under of the page, show the list of drinks (read from initial database) that user can scroll up to choose base on their preferences:
List of drinks is loaded from local storage of the app 
When clicking into certain drinks, it will show users the drinks’ properties( Iced, Sweet, Amount, Size) and finally show the total cash for purchasing.
Then it should have an “Add to cart” button, after clicking into this, it will switch to the menu page and a recent order is added to cart
Cart: Include list of drinks being chosen by user and a “Make order” button. When the user click to that button, a textbox for confirm(Yes or No) is existed for user to choose and then all the chosen drinks are cleared and move to the Ordered Status.
Membership: 
Have 2 parts for user: stamps and points
Stamp: show logo of 8 stamps. Reset whenever user reach enough 8 orders and allow them to redeem a free drink. 
Points: Is shown under accumulated bar. Is added based on the price of each drinks they order (1$ = 5 pts). It has landmarks for them to redeem a gift or a free drinks.
Has a part for Point history where show how the points were added during their past transactions.
Order: Include 2 parts: In process and History
In process: Show the current orders users have made from the cart and 2 options on each order: Received and Cancelled.
Whenever user touch any button, that order will come into history with corresponding status (Completed and Cancelled).

Notes: 
Every pages except for the main menu always have a “Return” button to return to the pages before and cancelled every recent action in that existed page.
Every place that contains an image( coffee image, shop’s logo, delivery’s icon,...) could be put blanked for refilled later.
