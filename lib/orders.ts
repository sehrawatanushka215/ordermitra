// Session 4's Prisma models, reduced to an in-memory list so this hands-on
// needs no database. The shape is the same; only the storage differs.

export type OrderStatus = "placed" | "packed" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  customerName: string;
  item: string;
  quantity: number;
  status: OrderStatus;
  placedOn: string;
};

export const ORDERS: Order[] = [
  {
    id: "OM-1041",
    customerName: "Mr. Iyer",
    item: "Brass diya",
    quantity: 47,
    status: "packed",
    placedOn: "2025-10-14",
  },
  {
    id: "OM-1042",
    customerName: "Priya Nair",
    item: "Cotton kurta",
    quantity: 2,
    status: "shipped",
    placedOn: "2025-10-16",
  },
  {
    id: "OM-1043",
    customerName: "Mr. Iyer",
    item: "Rangoli stencil set",
    quantity: 1,
    status: "delivered",
    placedOn: "2025-10-02",
  },
];
