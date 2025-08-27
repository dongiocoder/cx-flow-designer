"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calculator, DollarSign, Clock, Users, BarChart3 } from 'lucide-react';

interface CalculatorData {
  // Cost Variables (User Inputs)
  numberOfAgents: number;
  costPerAgentHourly: number;
  hoursPerAgentPerMonth: number;
  
  // Volume Variables (User Inputs)
  totalVolume: number;
  
  // Calculated Values
  costPerAgentPerMonth: number;
  totalMonthlyAgentCost: number;
  averageOutputPerAgent: number;
  averageCostPerConversation: number;
  averageHandleTime: number;
}

const defaultHoursPerMonth = 8 * 5 * 4.33; // 8 hours/day * 5 days/week * 4.33 weeks/month ≈ 173 hours

export function PerformanceCalculator() {
  const [data, setData] = useState<CalculatorData>({
    numberOfAgents: 10,
    costPerAgentHourly: 25,
    hoursPerAgentPerMonth: defaultHoursPerMonth,
    totalVolume: 5000,
    costPerAgentPerMonth: 0,
    totalMonthlyAgentCost: 0,
    averageOutputPerAgent: 0,
    averageCostPerConversation: 0,
    averageHandleTime: 0
  });

  // Calculate derived values whenever inputs change
  useEffect(() => {
    const costPerAgentPerMonth = data.costPerAgentHourly * data.hoursPerAgentPerMonth;
    const totalMonthlyAgentCost = costPerAgentPerMonth * data.numberOfAgents;
    const averageOutputPerAgent = data.numberOfAgents > 0 ? data.totalVolume / data.numberOfAgents : 0;
    const averageCostPerConversation = averageOutputPerAgent > 0 ? costPerAgentPerMonth / averageOutputPerAgent : 0;
    const averageHandleTime = data.hoursPerAgentPerMonth > 0 ? averageOutputPerAgent / data.hoursPerAgentPerMonth : 0;

    setData(prev => ({
      ...prev,
      costPerAgentPerMonth,
      totalMonthlyAgentCost,
      averageOutputPerAgent,
      averageCostPerConversation,
      averageHandleTime
    }));
  }, [data.numberOfAgents, data.costPerAgentHourly, data.hoursPerAgentPerMonth, data.totalVolume]);

  const handleInputChange = (field: keyof CalculatorData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const resetToDefaults = () => {
    setData({
      numberOfAgents: 10,
      costPerAgentHourly: 25,
      hoursPerAgentPerMonth: defaultHoursPerMonth,
      totalVolume: 5000,
      costPerAgentPerMonth: 0,
      totalMonthlyAgentCost: 0,
      averageOutputPerAgent: 0,
      averageCostPerConversation: 0,
      averageHandleTime: 0
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 1) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  return (
    <div className="p-6 flex-1 overflow-auto">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              Performance Calculator
            </h2>
            <p className="text-muted-foreground mt-1">
              Calculate baseline performance metrics for cost and volume analysis
            </p>
          </div>
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Cost Variables */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Cost Variables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="numberOfAgents" className="text-sm font-medium">
                      Number of Agents
                    </Label>
                    <Input
                      id="numberOfAgents"
                      type="number"
                      value={data.numberOfAgents}
                      onChange={(e) => handleInputChange('numberOfAgents', e.target.value)}
                      className="mt-1"
                      min="1"
                      step="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="costPerAgentHourly" className="text-sm font-medium">
                      Cost per Agent ($/hour)
                    </Label>
                    <Input
                      id="costPerAgentHourly"
                      type="number"
                      value={data.costPerAgentHourly}
                      onChange={(e) => handleInputChange('costPerAgentHourly', e.target.value)}
                      className="mt-1"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hoursPerAgentPerMonth" className="text-sm font-medium">
                      Hours per Agent per Month
                    </Label>
                    <Input
                      id="hoursPerAgentPerMonth"
                      type="number"
                      value={data.hoursPerAgentPerMonth}
                      onChange={(e) => handleInputChange('hoursPerAgentPerMonth', e.target.value)}
                      className="mt-1"
                      min="0"
                      step="0.1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Default: 8hrs/day × 5 days/week × 4.33 weeks/month = {formatNumber(defaultHoursPerMonth)} hours
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Calculated Cost Values */}
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700">Calculated Values</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost per Agent per Month:</span>
                      <span className="font-medium">{formatCurrency(data.costPerAgentPerMonth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Monthly Agent Cost:</span>
                      <span className="font-bold text-lg">{formatCurrency(data.totalMonthlyAgentCost)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Volume Variables */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Volume Variables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="totalVolume" className="text-sm font-medium">
                    Total Volume (conversations/month)
                  </Label>
                  <Input
                    id="totalVolume"
                    type="number"
                    value={data.totalVolume}
                    onChange={(e) => handleInputChange('totalVolume', e.target.value)}
                    className="mt-1"
                    min="0"
                    step="1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-700">Average Output per Agent</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {formatNumber(data.averageOutputPerAgent)} 
                        <span className="text-sm font-normal text-blue-600 ml-1">conversations/month</span>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-green-700">Average Cost per Conversation</div>
                      <div className="text-2xl font-bold text-green-900">
                        {formatCurrency(data.averageCostPerConversation)}
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-purple-700">Average Handle Time</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {formatNumber(data.averageHandleTime)}
                        <span className="text-sm font-normal text-purple-600 ml-1">conversations/hour</span>
                      </div>
                      <div className="text-xs text-purple-600 mt-1">
                        ≈ {formatNumber(60 / Math.max(data.averageHandleTime, 0.01))} minutes per conversation
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Summary Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Baseline Summary</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Agents:</span>
                        <span className="font-medium">{data.numberOfAgents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Volume:</span>
                        <span className="font-medium">{formatNumber(data.totalVolume, 0)} conversations</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Cost:</span>
                        <span className="font-medium">{formatCurrency(data.totalMonthlyAgentCost)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                        <span className="text-gray-700 font-medium">Cost per Conversation:</span>
                        <span className="font-bold">{formatCurrency(data.averageCostPerConversation)}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Improvement Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      AI Performance Baseline
                    </h4>
                    <p className="text-xs text-blue-700 mb-3">
                      Use these metrics as baseline to calculate AI automation benefits and cost savings.
                    </p>
                    <div className="text-xs text-blue-600">
                      <div className="font-medium">Ready for AI Analysis:</div>
                      <div>• Current cost per conversation: {formatCurrency(data.averageCostPerConversation)}</div>
                      <div>• Current handle time: {formatNumber(60 / Math.max(data.averageHandleTime, 0.01))} min/conversation</div>
                      <div>• Monthly capacity: {formatNumber(data.totalVolume, 0)} conversations</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
