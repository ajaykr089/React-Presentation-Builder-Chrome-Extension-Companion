'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, Space, Table as AntTable } from 'antd'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'

interface TableData {
  headers: string[]
  rows: string[][]
}

interface TableElementProps {
  data?: TableData
  onDataChange?: (data: TableData) => void
  width?: number
  height?: number
}

export function TableElement({
  data: initialData,
  onDataChange,
  width = 400,
  height = 200
}: TableElementProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [tableData, setTableData] = useState<TableData>(initialData || {
    headers: ['Column 1', 'Column 2', 'Column 3'],
    rows: [
      ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3'],
      ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3']
    ]
  })

  useEffect(() => {
    if (initialData) {
      setTableData(initialData)
    }
  }, [initialData])

  const handleEditClick = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = () => {
    onDataChange?.(tableData)
    setIsModalVisible(false)
  }

  const handleModalCancel = () => {
    setTableData(initialData || {
      headers: ['Column 1', 'Column 2', 'Column 3'],
      rows: [
        ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3'],
        ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3']
      ]
    })
    setIsModalVisible(false)
  }

  const updateHeader = (colIndex: number, value: string) => {
    const newHeaders = [...tableData.headers]
    newHeaders[colIndex] = value
    setTableData({ ...tableData, headers: newHeaders })
  }

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...tableData.rows]
    newRows[rowIndex][colIndex] = value
    setTableData({ ...tableData, rows: newRows })
  }

  const addColumn = () => {
    const newHeaders = [...tableData.headers, `Column ${tableData.headers.length + 1}`]
    const newRows = tableData.rows.map(row => [...row, ''])
    setTableData({
      headers: newHeaders,
      rows: newRows
    })
  }

  const removeColumn = (colIndex: number) => {
    if (tableData.headers.length > 1) {
      const newHeaders = tableData.headers.filter((_, i) => i !== colIndex)
      const newRows = tableData.rows.map(row => row.filter((_, i) => i !== colIndex))
      setTableData({
        headers: newHeaders,
        rows: newRows
      })
    }
  }

  const addRow = () => {
    const newRow = tableData.headers.map(() => '')
    setTableData({
      ...tableData,
      rows: [...tableData.rows, newRow]
    })
  }

  const removeRow = (rowIndex: number) => {
    if (tableData.rows.length > 1) {
      const newRows = tableData.rows.filter((_, i) => i !== rowIndex)
      setTableData({ ...tableData, rows: newRows })
    }
  }

  // Render the table for display
  const renderTable = () => {
    if (!tableData.headers.length || !tableData.rows.length) return null

    return (
      <table style={{
        width: '100%',
        height: '100%',
        borderCollapse: 'collapse',
        fontSize: '12px',
        backgroundColor: 'white'
      }}>
        <thead>
          <tr>
            {tableData.headers.map((header, index) => (
              <th key={index} style={{
                border: '1px solid #d9d9d9',
                padding: '4px 8px',
                backgroundColor: '#fafafa',
                fontWeight: 'bold',
                textAlign: 'left'
              }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex} style={{
                  border: '1px solid #d9d9d9',
                  padding: '4px 8px',
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {cell || '\u00A0'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  const hasData = tableData.headers.length > 0 && tableData.rows.length > 0

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer'
        }}
        onDoubleClick={handleEditClick}
      >
        {hasData ? (
          <div style={{ width: '100%', height: '100%', padding: '2px', overflow: 'hidden' }}>
            {renderTable()}
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              border: '2px dashed #ccc',
              borderRadius: '4px',
              padding: '8px'
            }}
          >
            <div style={{
              fontSize: '20px',
              marginBottom: '4px',
              textAlign: 'center'
            }}>
              📋
            </div>
            <div style={{
              fontSize: '10px',
              color: '#666',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              Double-click to edit table
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Edit Table"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={900}
        okText="Save Table"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ marginBottom: 16 }}>
            <Button onClick={addRow} style={{ marginRight: 8 }}>
              <PlusOutlined /> Add Row
            </Button>
            <Button onClick={addColumn}>
              <PlusOutlined /> Add Column
            </Button>
          </div>

          <div style={{
            maxHeight: '400px',
            overflow: 'auto',
            border: '1px solid #d9d9d9',
            borderRadius: '4px'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr>
                  {tableData.headers.map((header, colIndex) => (
                    <th key={colIndex} style={{
                      border: '1px solid #d9d9d9',
                      padding: '8px',
                      backgroundColor: '#fafafa',
                      position: 'relative'
                    }}>
                      <Input
                        value={header}
                        onChange={(e) => updateHeader(colIndex, e.target.value)}
                        style={{ fontWeight: 'bold' }}
                      />
                      {tableData.headers.length > 1 && (
                        <Button
                          size="small"
                          danger
                          icon={<MinusOutlined />}
                          onClick={() => removeColumn(colIndex)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '20px',
                            height: '20px',
                            fontSize: '10px'
                          }}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} style={{
                        border: '1px solid #d9d9d9',
                        padding: '8px',
                        position: 'relative'
                      }}>
                        <Input
                          value={cell}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          placeholder={`Cell ${rowIndex + 1},${colIndex + 1}`}
                        />
                      </td>
                    ))}
                    {tableData.rows.length > 1 && (
                      <td style={{
                        border: '1px solid #d9d9d9',
                        padding: '8px',
                        width: '40px'
                      }}>
                        <Button
                          size="small"
                          danger
                          icon={<MinusOutlined />}
                          onClick={() => removeRow(rowIndex)}
                          style={{
                            width: '24px',
                            height: '24px',
                            fontSize: '10px'
                          }}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ color: '#666', fontSize: '12px' }}>
            Table size: {tableData.headers.length} columns × {tableData.rows.length} rows
          </div>
        </Space>
      </Modal>
    </>
  )
}
