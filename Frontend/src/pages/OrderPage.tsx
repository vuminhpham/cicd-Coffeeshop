/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axiosClient from "@/apis/axiosClient";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "@/redux/reducers/cartSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/FormatCurrency";
import { useNavigate } from "react-router-dom";

interface Table {
  id: number;
  tableName: string;
  capacity: number;
  status: string;
}

const OrderPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [numPeople, setNumPeople] = useState<number>(1);
  const [reservationContent, setReservationContent] = useState<string>("");

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axiosClient.get("/tables");
        setTables(response.data);
      } catch (error) {
        console.error("Failed to fetch tables:", error);
        toast.error("Failed to fetch tables");
      }
    };
    fetchTables();
  }, []);

  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity >= 0) {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const handleRemoveItem = (id: number) => {
    dispatch(removeFromCart(id));
    toast.success("Item removed from cart");
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTotalFormatted = () => {
    return formatCurrency(calculateTotal());
  };

  // 🧾 Thanh toán local (không dùng PayPal)
  const handleLocalPayment = async () => {
    if (!user) {
      toast.error("Please log in to place an order");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (selectedTableId) {
      const selectedTable = tables.find(
        (table) => table.id === Number(selectedTableId)
      );
      if (!selectedTable) {
        toast.error("Selected table not found");
        return;
      }

      if (selectedTable.status === "BOOKED") {
        toast.error("This table is already booked");
        return;
      }

      if (numPeople <= 0) {
        toast.error("Number of people must be greater than 0");
        return;
      }

      if (numPeople > selectedTable.capacity) {
        toast.error(
          `This table can only accommodate ${selectedTable.capacity} people`
        );
        return;
      }
    }

    const orderRequest = {
      items: cartItems.map((item: any) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      tableId: selectedTableId ? Number(selectedTableId) : null,
      numPeople: selectedTableId ? numPeople : null,
      reservationContent: selectedTableId ? reservationContent : null,
      orderStatus: "PENDING", // Local payment — chờ thanh toán
      paymentMethod: "LOCAL", // thêm nếu backend có field này
    };

    try {
      await axiosClient.post("/orders", orderRequest);
      toast.success("Order placed successfully! Please pay at the counter.");
      dispatch(clearCart());
      setSelectedTableId(null);
      setNumPeople(1);
      setReservationContent("");
      navigate("/order-success");
    } catch (error: any) {
      console.error("Failed to place order:", error);
      toast.error(error.response?.data?.message || "Failed to place order.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Place an Order</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Cart</CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <img
                              src={item.imageUrl}
                              className="w-20 h-20 rounded-xl"
                              alt=""
                            />
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  Number(e.target.value)
                                )
                              }
                              className="w-20"
                              min="0"
                            />
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.price * item.quantity)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 text-right">
                    <p className="text-lg font-semibold">
                      Total: {calculateTotalFormatted()}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Table (Optional)
                </label>
                <Select
                  onValueChange={setSelectedTableId}
                  value={selectedTableId || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={table.id.toString()}>
                        {table.tableName} (Capacity: {table.capacity}, Status:{" "}
                        {table.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTableId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Number of People
                    </label>
                    <Input
                      type="number"
                      value={numPeople}
                      onChange={(e) => setNumPeople(Number(e.target.value))}
                      min="1"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Reservation Notes (Optional)
                    </label>
                    <Textarea
                      value={reservationContent}
                      onChange={(e: any) =>
                        setReservationContent(e.target.value)
                      }
                      placeholder="Enter any special requests or notes"
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {/* Nút thanh toán local */}
              <Button onClick={handleLocalPayment} className="w-full">
                Place Order (Pay at Counter)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
