// app/dashboard/admin/orders/[id]/page.tsx
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  XCircle,
  ChevronLeft
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { getServerAuth } from "@/lib/api/services/auth/server";
import { getOrderById } from "@/lib/api/services/order/order";
import OrderStatusUpdate from "../../components/OrderStatusUpdate";
import PrintButton from "../../components/PrintButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const { user, token } = await getServerAuth();

  // Fetch order details
  const orderResult = await getOrderById(resolvedParams.id, token || "");
  const orderData = orderResult?.data || orderResult;

  // Check if orderData exists AND has required properties
  if (!orderData || !orderData._id) {
    return (
      <div className="mx-auto max-w-screen-lg space-y-4 lg:mt-10">
        <Card>
          <CardContent className="p-10 text-center">
            <h2 className="text-xl font-semibold">Order not found</h2>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/dashboard/admin/orders">
                <ChevronLeft /> Back to Orders
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract customer info from shippingAddress
  const shippingAddr = orderData.shippingAddress || {};
  const customerInfo = {
    name: `${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}`.trim() || orderData.guest || "Guest Customer",
    email: shippingAddr.email || "N/A",
    phone: shippingAddr.phone || "N/A",
    address: shippingAddr.address || "N/A",
    city: shippingAddr.city,
    postalCode: shippingAddr.postalCode
  };

  // Updated status order and mapping
  const statusOrder = ["Processing", "Shipped", "Out for Delivery", "Delivered"];
  
  // Handle cancelled status separately
  const isCancelled = orderData.status === "Cancelled";
  const currentStepIndex = isCancelled ? -1 : statusOrder.indexOf(orderData.status);

  // Badge variant mapping
  const statusBadgeMap = {
    Processing: "warning" as const,
    Shipped: "default" as const,
    "Out for Delivery": "default" as const,
    Delivered: "success" as const,
    Cancelled: "destructive" as const
  };

  // Icon mapping for each status
  const statusIcons = {
    Processing: Package,
    Shipped: Truck,
    "Out for Delivery": Truck,
    Delivered: Home
  };

  return (
    <div className="mx-auto max-w-screen-lg space-y-4 lg:mt-10">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/dashboard/admin/orders">
            <ChevronLeft />
          </Link>
        </Button>
        <div className="flex gap-2">
          <PrintButton />
          <OrderStatusUpdate orderId={orderData._id} currentStatus={orderData.status} token={token} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Order #{orderData._id.slice(-8)}</CardTitle>
            <p className="text-muted-foreground text-sm">
              Placed on {new Date(orderData.createdAt).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Customer Information</h3>
                <p className="text-muted-foreground text-sm">{customerInfo.name}</p>
                <p className="text-muted-foreground text-sm">{customerInfo.email}</p>
                <p className="text-muted-foreground text-sm">{customerInfo.phone}</p>
                <p className="text-muted-foreground text-sm">
                  {customerInfo.address}
                  {customerInfo.city && `, ${customerInfo.city}`}
                  {customerInfo.postalCode && ` - ${customerInfo.postalCode}`}
                </p>
              </div>
              <div className="bg-muted flex items-center justify-between space-y-2 rounded-md border p-4">
                <div className="space-y-1">
                  <h4 className="font-medium">Order Status</h4>
                  <Badge variant={statusBadgeMap[orderData.status as keyof typeof statusBadgeMap]}>
                    {orderData.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs. {orderData.subtotal?.toFixed(2) || "0.00"}</span>
            </div>
            {orderData.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- Rs. {orderData.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>Rs. {orderData.delivery?.toFixed(2) || "0.00"}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>Rs. {orderData.total?.toFixed(2) || "0.00"}</span>
            </div>
            {orderData.discountRef && (
              <div className="text-muted-foreground text-sm">
                Discount Code: <span className="font-mono">{orderData.discountRef}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Order Status Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCancelled ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <XCircle className="size-8" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg">Order Cancelled</p>
                <p className="text-muted-foreground text-sm">
                  This order was cancelled on {new Date(orderData.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative space-y-6 pt-1">
              <div className="mb-2 flex items-center justify-between">
                {statusOrder.map((step, index) => {
                  const Icon = statusIcons[step as keyof typeof statusIcons];
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={index} className="flex flex-col items-center text-center flex-1">
                      <div
                        className={`flex size-10 items-center justify-center rounded-full text-lg lg:size-12 transition-colors ${
                          isCompleted
                            ? "bg-green-500 text-white dark:bg-green-900"
                            : "bg-muted border"
                        } `}>
                        {isCompleted && index < currentStepIndex ? (
                          <CheckCircle className="size-4 lg:size-5" />
                        ) : (
                          <Icon className="size-4 lg:size-5" />
                        )}
                      </div>
                      <div className={`mt-2 text-xs font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-6">
                <Progress
                  className="w-full"
                  value={currentStepIndex >= 0 ? ((currentStepIndex + 1) / statusOrder.length) * 100 : 0}
                />
                <div className="text-muted-foreground text-xs">
                  <Badge variant={statusBadgeMap[orderData.status as keyof typeof statusBadgeMap]} className="me-1">
                    {orderData.status}
                  </Badge>{" "}
                  Last updated on {new Date(orderData.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items ({orderData.items?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-center">Price</TableHead>
                <TableHead className="text-end">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderData.items && orderData.items.length > 0 ? (
                orderData.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        {item.image ? (
                          <Image
                            src={item.image}
                            width={60}
                            height={60}
                            className="h-10 w-10 rounded-md lg:h-16 lg:w-16 object-cover"
                            alt={item.title || "Product"}
                            unoptimized
                          />
                        ) : (
                          <div className="h-10 w-10 lg:h-16 lg:w-16 rounded-md bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{item.title || "Product"}</p>
                          {item.size && (
                            <p className="text-muted-foreground text-xs">Size: {item.size}</p>
                          )}
                          {item.color && (
                            <p className="text-muted-foreground text-xs">Color: {item.color}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity || 0}</TableCell>
                    <TableCell className="text-center">Rs. {item.price?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell className="text-end">
                      Rs. {((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No items in this order
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}