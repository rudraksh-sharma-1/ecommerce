import React, { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";

import { IoCloseSharp } from "react-icons/io5";

import CategoryCollapse from "../../CategoryCollapse";

const CategoryPanel = ({ isOpenCatPanel, setIsOpenCatPanel }) => {
  const [submenuIndex, setSubmenuIndex] = useState(null);
  const [innerSubmenuIndex, setInnerSubmenuIndex] = useState(null);

  const toggleDrawer = (open) => () => {
    setIsOpenCatPanel(open);
  };

  const openSubmenu = (index) => {
    if (submenuIndex === index) {
      setSubmenuIndex(null);
    } else {
      setSubmenuIndex(index);
    }
  };

  const openInnerSubmenu = (index) => {
    if (innerSubmenuIndex === index) {
      setInnerSubmenuIndex(null);
    } else {
      setInnerSubmenuIndex(index);
    }
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" className="categoryPanel">
      <h3 className="p-3 text-[16px] font-[500] flex items-center justify-between">
        Shop by Categories
        <IoCloseSharp
          onClick={toggleDrawer(false)}
          className="cursor-pointer text-[20px]"
        />
      </h3>

      <CategoryCollapse
        submenuIndex={submenuIndex}
        innerSubmenuIndex={innerSubmenuIndex}
        openSubmenu={openSubmenu}
        openInnerSubmenu={openInnerSubmenu}
        setIsOpenCatPanel={setIsOpenCatPanel}
      />

    </Box>
  );

  return (
    <>
      <Drawer open={isOpenCatPanel} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
};

export default CategoryPanel;