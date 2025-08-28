"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Download, Calendar, DollarSign, AlertCircle, CheckCircle } from "lucide-react";

export function BillingSettings() {
  const [currentPlan] = useState({
    name: 'Professional',
    price: 29,
    period: 'month',
    features: [
      'Up to 50 workstreams',
      'Advanced flow editor',
      'Team collaboration',
      'Priority support',
      'Custom integrations'
    ]
  });

  const [paymentMethod] = useState({
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expiryMonth: 12,
    expiryYear: 2025
  });

  const [billingHistory] = useState([
    {
      id: '1',
      date: '2024-01-15',
      amount: 29.00,
      status: 'paid',
      description: 'Professional Plan - January 2024'
    },
    {
      id: '2',
      date: '2023-12-15',
      amount: 29.00,
      status: 'paid',
      description: 'Professional Plan - December 2023'
    },
    {
      id: '3',
      date: '2023-11-15',
      amount: 29.00,
      status: 'paid',
      description: 'Professional Plan - November 2023'
    }
  ]);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showUpdateCard, setShowUpdateCard] = useState(false);

  const plans = [
    {
      name: 'Starter',
      price: 9,
      period: 'month',
      features: [
        'Up to 10 workstreams',
        'Basic flow editor',
        'Email support',
        '1 team member'
      ]
    },
    {
      name: 'Professional',
      price: 29,
      period: 'month',
      features: [
        'Up to 50 workstreams',
        'Advanced flow editor',
        'Team collaboration',
        'Priority support',
        'Custom integrations'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 99,
      period: 'month',
      features: [
        'Unlimited workstreams',
        'Advanced analytics',
        'SSO integration',
        'Dedicated support',
        'Custom deployment'
      ]
    }
  ];

  const handleCancelSubscription = () => {
    // TODO: Implement subscription cancellation
    console.log('Cancelling subscription...');
    setShowCancelConfirm(false);
  };

  const handleUpdatePaymentMethod = () => {
    // TODO: Implement payment method update
    console.log('Updating payment method...');
    setShowUpdateCard(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-medium text-gray-900">Billing</h2>
        <p className="text-muted-foreground mt-1">Manage your subscription, payment methods, and billing history.</p>
      </div>

      {/* Current Plan Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Current Plan</span>
          </CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
              <p className="text-muted-foreground">
                ${currentPlan.price}/{currentPlan.period}
              </p>
              <Badge variant="default" className="mt-2">Active</Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-2">Next billing date</p>
              <p className="font-medium">February 15, 2024</p>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-medium mb-2">Plan Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans Section */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Upgrade or downgrade your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`border rounded-lg p-4 relative ${
                  plan.name === currentPlan.name ? 'border-primary bg-primary/5' : ''
                } ${plan.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-4">Most Popular</Badge>
                )}
                <div className="text-center">
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <div className="text-3xl font-bold my-2">
                    ${plan.price}
                    <span className="text-sm text-muted-foreground">/{plan.period}</span>
                  </div>
                  <ul className="text-sm space-y-1 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.name === currentPlan.name ? "outline" : "default"}
                    disabled={plan.name === currentPlan.name}
                  >
                    {plan.name === currentPlan.name ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Payment Method</span>
            </CardTitle>
            <CardDescription>Manage your payment information</CardDescription>
          </div>
          <Dialog open={showUpdateCard} onOpenChange={setShowUpdateCard}>
            <DialogTrigger asChild>
              <Button variant="outline">Update Card</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Payment Method</DialogTitle>
                <DialogDescription>
                  Enter your new credit card information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input id="cardName" placeholder="John Doe" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUpdateCard(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePaymentMethod}>Update Card</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium capitalize">
                {paymentMethod.brand} ending in {paymentMethod.last4}
              </p>
              <p className="text-sm text-muted-foreground">
                Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Billing History</span>
          </CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingHistory.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                    {invoice.status}
                  </Badge>
                  <span className="font-medium">${invoice.amount.toFixed(2)}</span>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Management Section */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <span>Subscription Management</span>
          </CardTitle>
          <CardDescription>Cancel or modify your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Canceling your subscription will downgrade your account to the free plan at the end of your current billing period.
            </p>
            <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
              <DialogTrigger asChild>
                <Button variant="destructive">Cancel Subscription</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Subscription</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel your subscription? Your account will be downgraded to the free plan at the end of your current billing period.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
                    Keep Subscription
                  </Button>
                  <Button variant="destructive" onClick={handleCancelSubscription}>
                    Cancel Subscription
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}