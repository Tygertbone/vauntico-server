provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = "af-johannesburg-1"
}

resource "oci_core_instance" "vauntico_server" {
  availability_domain = "jnyM:AF-JOHANNESBURG-1-AD-1"
  compartment_id      = var.compartment_id
  shape               = "VM.Standard.E2.1.Micro"

  create_vnic_details {
    assign_public_ip = true
    subnet_id        = var.subnet_id
  }

  source_details {
    source_type = "image"
    image_id    = var.oracle_linux_9_image_id
  }

  display_name = "instance-20251230-0934"
}
