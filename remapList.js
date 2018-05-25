const remapList = (items) => {
    const list = []
    let
        columnContainer = [],
        accumulatorCol = 0,
        rowN = 0,
        msGridColumnOffset = 0
    
    items.forEach((item, index) => {
        const colN = index === 6 ? 12 : item
        const msGridColumn = msGridColumnOffset + 1

        if (!accumulatorCol) {
            list.push({
                rowN,
                pos: { 
                    x: rowN + rowN * 1 + 1, 
                    y: 1
                },
                columns: columnContainer
            })
            ++rowN
        }
        
        accumulatorCol += colN
        
        if (accumulatorCol && accumulatorCol <= 12) {
            columnContainer.push({
                i: index,
                n: item,
                pos: { x: 1, y: msGridColumn }
            })
        } else {
            columnContainer = []
            columnContainer.push({
                i: index,
                n: item,
                pos: { x: 1, y: 1 }
            })
            list.push({
                rowN,
                pos: { 
                    x: rowN + rowN * 1 + 1, 
                    y: 1
                },
                columns: columnContainer
            })
            // reset and add values to accumulators
            ++rowN
            accumulatorCol = colN
            msGridColumnOffset = 0
        }


        msGridColumnOffset += colN * 2
    })
    
    return list
}

const items = [6, 6, 4, 4, 4, 12, 12]

const result = remapList(items)

console.log(JSON.stringify(result, null, 4))
