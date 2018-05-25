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

        if (accumulatorCol === 0) {
            list.push({
                props: {
                    rowN,
                    'fr-row': 1,
                    'fr-col': 12,
                    '-ms-grid-rows': '1fr 10px',
                    '-ms-grid-row': rowN + rowN * 1 + 1,
                    '-ms-grid-column': 1,
                    '-ms-grid-column-span': 23
                },
                columns: columnContainer
            })
        }

        accumulatorCol += colN
        msGridColumnOffset += colN * 2
        if (accumulatorCol > 12) {
            ++rowN
            accumulatorCol = colN
            msGridColumnOffset = 0
            columnContainer = []

            columnContainer.push({
                props: {
                    colN,
                    'fr-row': 1,
                    'fr-col': colN,
                    '-ms-grid-row': 1,
                    '-ms-grid-column': 1
                },
                item
            })
            list.push({
                props: {
                    rowN,
                    'fr-row': 1,
                    'fr-col': 12,
                    '-ms-grid-rows': '1fr 10px',
                    '-ms-grid-row': rowN + rowN * 1 + 1,
                    '-ms-grid-column': 1,
                    '-ms-grid-column-span': 23
                },
                columns: columnContainer
            })
        } else {
            columnContainer.push({
                props: {
                    colN,
                    'fr-row': 1,
                    'fr-col': colN,
                    '-ms-grid-row': 1,
                    '-ms-grid-column': msGridColumn
                },
                item
            })
        }


    })
    
    return list
}

const items = [12, 12, 12, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 7, 6, 6, 12, 13, 1, 11, 4, 4, 4, 3, 3, 3, 3]

const result = remapList(items)

console.log(JSON.stringify(result, null, 4))
