import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link className="brand" to="/" aria-label="SITESNN — на главную">
      <span className="brand__mark" aria-hidden="true"><i /><i /><i /></span>
      <span className="brand__text">SITES<span>NN</span></span>
      <small>digital systems</small>
    </Link>
  )
}
