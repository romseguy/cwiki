import { Table, TableProps, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import React from "react";
import { bytesForHuman } from "utils/string";

export const FileInputTable = ({
  list,
  setList,
  ...props
}: TableProps & {
  list: File[];
  setList: React.Dispatch<React.SetStateAction<File[]>>;
}) => {
  const handleDelete = (i: number) => {
    if (list && setList) {
      const newList = list.filter((f, index) => index !== i);
      setList(newList);
    }
  };

  return (
    <Table {...props}>
      <Thead>
        <Tr>
          {/* <Th scope="col"></Th> */}
          <Th scope="col">Nom</Th>
          <Th scope="col">Taille</Th>
          <Th scope="col">Type</Th>
          <Th scope="col"></Th>
        </Tr>
      </Thead>
      <Tbody>
        {list.map((item, i) => {
          return (
            <Tr key={i}>
              {/* <Td>
                  {i > 0 ? (
                    <button key={i + ":up"} onClick={(e) => handleUp(i)}>
                      {String.fromCharCode(9650)}
                    </button>
                  ) : i < list.length - 1 ? (
                    <button key={i + ":down"} onClick={(e) => handleDown(i)}>
                      {String.fromCharCode(9660)}
                    </button>
                  ) : null}
                </Td> */}
              <Td>
                {/* {item.name.length > collapseLength
                      ? item.name.substr(0, collapseLength)
                      : item.name} */}
                {item.name}
              </Td>
              <Td>{bytesForHuman(item.size, 2)}</Td>
              <Td>{item.type}</Td>
              <Td>
                <button
                  key={i + ":del"}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(i);
                  }}
                >
                  {String.fromCharCode(10006)}
                </button>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
