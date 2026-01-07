'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, Select, Space, Table, InputNumber } from 'antd'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }>
}

interface ChartElementProps {
  data?: ChartData
  type?: 'bar' | 'line' | 'pie' | 'doughnut'
  onDataChange?: (data: ChartData, type: string) => void
  width?: number
  height?: number
  isDragging?: boolean
  isSelected?: boolean
  onSelect?: () => void
}

const chartColors = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#13c2c2', '#fadb14', '#eb2f96', '#52c41a', '#fa8c16'
]

export function ChartElement({
  data: initialData,
  type = 'bar',
  onDataChange,
  width = 300,
  height = 200,
  isDragging = false,
  isSelected = false,
  onSelect
}: ChartElementProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'doughnut'>(type)
  const [chartData, setChartData] = useState<ChartData>(initialData || {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Dataset 1',
      data: [12, 19, 3, 5, 2],
      backgroundColor: chartColors.slice(0, 5),
      borderColor: '#1890ff',
      borderWidth: 1
    }]
  })
  const [canEdit, setCanEdit] = useState(true) // Start as true for immediate editing
  const [justFinishedDragging, setJustFinishedDragging] = useState(false)

  const defaultData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Dataset 1',
      data: [12, 19, 3, 5, 2],
      backgroundColor: chartColors.slice(0, 5),
      borderColor: '#1890ff',
      borderWidth: 1
    }]
  }

  useEffect(() => {
    if (initialData) {
      setChartData(initialData)
    }
  }, [initialData])

  // Track when dragging just finished
  useEffect(() => {
    if (!isDragging && justFinishedDragging) {
      // Just finished dragging, prevent clicks for a short time
      const timer = setTimeout(() => setJustFinishedDragging(false), 200)
      return () => clearTimeout(timer)
    } else if (isDragging) {
      setJustFinishedDragging(true)
    }
  }, [isDragging, justFinishedDragging])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.()
  }

  const handleEditClick = () => {
    // Simplified for debugging - just check if we can edit
    if (canEdit) {
      setIsModalVisible(true)
    }
  }

  const handleModalOk = () => {
    onDataChange?.(chartData, chartType)
    setIsModalVisible(false)
  }

  const handleModalCancel = () => {
    setChartData(initialData || defaultData)
    setIsModalVisible(false)
  }

  const addLabel = () => {
    const newLabels = [...chartData.labels, `Item ${chartData.labels.length + 1}`]
    const newDatasets = chartData.datasets.map(dataset => ({
      ...dataset,
      data: [...dataset.data, Math.floor(Math.random() * 20) + 1]
    }))

    setChartData({
      ...chartData,
      labels: newLabels,
      datasets: newDatasets
    })
  }

  const removeLabel = (index: number) => {
    if (chartData.labels.length > 1) {
      const newLabels = chartData.labels.filter((_, i) => i !== index)
      const newDatasets = chartData.datasets.map(dataset => ({
        ...dataset,
        data: dataset.data.filter((_, i) => i !== index)
      }))

      setChartData({
        ...chartData,
        labels: newLabels,
        datasets: newDatasets
      })
    }
  }

  const updateLabel = (index: number, value: string) => {
    const newLabels = [...chartData.labels]
    newLabels[index] = value
    setChartData({ ...chartData, labels: newLabels })
  }

  const updateDataPoint = (datasetIndex: number, dataIndex: number, value: number) => {
    const newDatasets = [...chartData.datasets]
    newDatasets[datasetIndex].data[dataIndex] = value
    setChartData({ ...chartData, datasets: newDatasets })
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: chartType === 'bar' || chartType === 'line' ? {
      y: {
        beginAtZero: true,
      },
    } : {},
  }

  const renderChart = () => {
    const chartProps = {
      data: chartData,
      options: chartOptions,
      width: width,
      height: height
    }

    switch (chartType) {
      case 'bar':
        return <Bar {...chartProps} />
      case 'line':
        return <Line {...chartProps} />
      case 'pie':
        return <Pie {...chartProps} />
      case 'doughnut':
        return <Doughnut {...chartProps} />
      default:
        return <Bar {...chartProps} />
    }
  }

  const hasData = chartData.labels.length > 0 && chartData.datasets.some(ds => ds.data.length > 0)

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer'
        }}
        onClick={handleClick}
        onDoubleClick={handleEditClick}
      >
        {hasData ? (
          <div style={{ width: '100%', height: '100%', padding: '8px' }}>
            {renderChart()}
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              border: '2px dashed #ccc',
              borderRadius: '4px'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Double-click to edit chart</div>
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Edit Chart"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText="Save Chart"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item label="Chart Type">
            <Select value={chartType} onChange={setChartType}>
              <Select.Option value="bar">Bar Chart</Select.Option>
              <Select.Option value="line">Line Chart</Select.Option>
              <Select.Option value="pie">Pie Chart</Select.Option>
              <Select.Option value="doughnut">Doughnut Chart</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <h4>Chart Preview:</h4>
            <div style={{ height: '300px', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '16px' }}>
              {renderChart()}
            </div>
          </div>

          <div>
            <h4>Data Labels:</h4>
            <Table
              dataSource={chartData.labels.map((label, index) => ({
                key: index,
                label,
                index
              }))}
              columns={[
                {
                  title: 'Label',
                  dataIndex: 'label',
                  render: (text, record) => (
                    <Input
                      value={text}
                      onChange={(e) => updateLabel(record.index, e.target.value)}
                    />
                  )
                },
                {
                  title: 'Action',
                  render: (_, record) => (
                    <Button
                      danger
                      size="small"
                      onClick={() => removeLabel(record.index)}
                      disabled={chartData.labels.length <= 1}
                    >
                      Remove
                    </Button>
                  )
                }
              ]}
              pagination={false}
              size="small"
            />
            <Button onClick={addLabel} style={{ marginTop: 8 }}>
              Add Label
            </Button>
          </div>

          {chartData.datasets.map((dataset, datasetIndex) => (
            <div key={datasetIndex}>
              <h4>Dataset {datasetIndex + 1}:</h4>
              <Table
                dataSource={dataset.data.map((value, dataIndex) => ({
                  key: dataIndex,
                  label: chartData.labels[dataIndex],
                  value
                }))}
                columns={[
                  {
                    title: 'Label',
                    dataIndex: 'label',
                    width: 120
                  },
                  {
                    title: 'Value',
                    dataIndex: 'value',
                    render: (text, record) => (
                      <InputNumber
                        value={text}
                        onChange={(value) => updateDataPoint(datasetIndex, record.key, value || 0)}
                        min={0}
                      />
                    )
                  }
                ]}
                pagination={false}
                size="small"
              />
            </div>
          ))}
        </Space>
      </Modal>
    </>
  )
}
