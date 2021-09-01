import { RATING_THEME_KEY, RatingField } from './Field/Rating'
import { YESNO_THEME_KEY, YesNoField } from './Field/YesNo'
import { Badge } from './Badge'
import { Banner } from './Banner'
import { Button } from './Button'
import { CloseButton } from './CloseButton'
import { Form } from './Form'
import { FormError } from './FormError'
import { FormLabel } from './FormLabel'
import { InlineMessage } from './InlineMessage'
import { Input } from './Input'
import { Link } from './Link'
import { Modal } from './Modal'
import { NumberInput } from './NumberInput'
import { Pagination, PAGINATION_THEME_KEY } from './Pagination'
import { PhoneNumberInput } from './PhoneNumberInput'
import { Searchbar, SEARCHBAR_THEME_KEY } from './Searchbar'
import { Tabs } from './Tabs'
import { Textarea } from './Textarea'
import { Tile } from './Tile'
import { Toast } from './Toast'
import { Toggle, TOGGLE_THEME_KEY } from './Toggle'

export const components = {
  Badge,
  Banner,
  Button,
  CloseButton,
  Form,
  FormError,
  FormLabel,
  Input,
  Link,
  InlineMessage,
  Modal,
  NumberInput,
  PhoneNumberInput,
  Textarea,
  Tabs,
  [PAGINATION_THEME_KEY]: Pagination,
  [SEARCHBAR_THEME_KEY]: Searchbar,
  [RATING_THEME_KEY]: RatingField,
  [YESNO_THEME_KEY]: YesNoField,
  [TOGGLE_THEME_KEY]: Toggle,
  Tile,
  Toast,
}
