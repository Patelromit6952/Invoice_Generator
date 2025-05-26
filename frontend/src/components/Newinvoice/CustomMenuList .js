import  { components } from 'react-select';

 const CustomMenuList = ({ children, ...props }) => {
  const { selectProps } = props;

  return (
    <components.MenuList {...props}>
      <div
        style={{
        overflow:'auto',
          borderTop: '1px solid #eee',
          padding: '8px',
          display: 'flex',
          justifyContent: 'space-evenly',
        }}
      >
        <button
          style={{ padding: '6px 12px', cursor: 'pointer' }}
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent menu from closing
            selectProps.onAdd();
          }}
        >
          ➕ Add
        </button>

        <button
          style={{

            padding: '6px 12px',
            cursor: selectProps.value ? 'pointer' : 'not-allowed',
            opacity: selectProps.value ? 1 : 0.5,
          }}
          disabled={!selectProps.value}
          onMouseDown={(e) => {
            e.preventDefault();
            selectProps.onEdit(selectProps.value);
          }}
        >
          ✏️ Edit
        </button>
      </div>
      {children}
    </components.MenuList>
  );
};

export default CustomMenuList