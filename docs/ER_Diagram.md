# Database ER Diagram (Phase 4)

Below is the Entity-Relationship (ER) Diagram mapping out our Database Architecture for the Enterprise E-Commerce Platform. This visualizes the `Prisma` schema we will implement in Phase 5.

```mermaid
erDiagram
    USER {
        String id PK "UUID"
        String clerkId "Unique Auth ID"
        String email
        String name
        Role role "ENUM (ADMIN, SELLER, CUSTOMER)"
        DateTime createdAt
        DateTime updatedAt
    }

    STORE {
        String id PK "UUID"
        String name
        String description
        String sellerId FK "Refers to USER"
        DateTime createdAt
        DateTime updatedAt
    }

    CATEGORY {
        String id PK "UUID"
        String name
        String slug
        String billboardId FK
        DateTime createdAt
        DateTime updatedAt
    }

    BRAND {
        String id PK "UUID"
        String name
        String logoUrl
    }

    PRODUCT {
        String id PK "UUID"
        String storeId FK
        String categoryId FK
        String brandId FK
        String name
        String description
        Float originalPrice
        Float offerPrice
        Int discount
        Boolean isFeatured
        Boolean isArchived
        DateTime createdAt
        DateTime updatedAt
    }

    PRODUCT_VARIANT {
        String id PK "UUID"
        String productId FK
        String size
        String color
        String sku
        Int stock
    }

    PRODUCT_IMAGE {
        String id PK "UUID"
        String productId FK
        String url
        Boolean isPrimary
    }

    ORDER {
        String id PK "UUID"
        String storeId FK
        String customerId FK "Refers to USER"
        String razorpayOrderId
        String status "ENUM (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)"
        Float totalAmount
        String address
        String phone
        DateTime createdAt
        DateTime updatedAt
    }

    ORDER_ITEM {
        String id PK "UUID"
        String orderId FK
        String productId FK
        String variantId FK
        Int quantity
        Float price
    }

    REVIEW {
        String id PK "UUID"
        String productId FK
        String customerId FK "Refers to USER"
        Int rating
        String comment
        DateTime createdAt
    }

    COUPON {
        String id PK "UUID"
        String storeId FK
        String code
        Float discountPercent
        DateTime expiryDate
        Boolean isActive
    }

    USER ||--o{ STORE : "Owns (if Seller)"
    USER ||--o{ ORDER : "Places (if Customer)"
    USER ||--o{ REVIEW : "Writes (if Customer)"

    STORE ||--o{ PRODUCT : "Sells"
    STORE ||--o{ ORDER : "Receives"
    STORE ||--o{ COUPON : "Creates"

    CATEGORY ||--o{ PRODUCT : "Categorizes"
    BRAND ||--o{ PRODUCT : "Brands"

    PRODUCT ||--o{ PRODUCT_VARIANT : "Has Variants"
    PRODUCT ||--o{ PRODUCT_IMAGE : "Has Images"
    PRODUCT ||--o{ ORDER_ITEM : "Included In"
    PRODUCT ||--o{ REVIEW : "Receives"

    ORDER ||--|{ ORDER_ITEM : "Contains"
```
